/*
GarageDoorAutoClose_accessory.js

To be used with garage gates that open with button press and automatically close after a set period of time
This is a common setup in shared garages like in apartment buildings
This accessory for HAP-NodeJs is designed to work with a relay board wired to a garage door remote.
*/

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var rpio = require('rpio');

//Define the pin number for the relay GPIO
//the rpio module uses the physical numbering scheme
//Pin 16 is GPIO 23
var pinNumber = 16;

//Time in milliseconds to hold the garage open signal
var doorOpenButtonTimeout = 3000;

//Time in milliseconds it takes for the door to open 
var doorOpeningTimeout = 10000;

//Time in milliseconds that the garage door will stay open after opening, and before automatically closing
var doorAutoCloseTimeout = 30000;

//Time in milliseconds it takes for the door to close 
var doorClosingTimeout = 10000;

//Strings to represent the Characteristic.CurrentDoorState enum
var doorStateString = ["open.", "closed.", "opening.", "closing.", "stopped."]

//Create the GarageDoorAutoClose object
var GarageDoorAutoClose = {

  //Garage door is initially closed
  doorState: Characteristic.CurrentDoorState.CLOSED,

  //Define the open function, with the garage object being passed as an argument
  open: function (garage) {

    //Start by activating the relay board
    console.log("Pressing Garage Button");
    rpio.open(pinNumber, rpio.OUTPUT, rpio.HIGH);
    rpio.write(pinNumber, rpio.LOW);
    rpio.close(pinNumber);

    //After doorOpenButtonTimeout has elapsed, deactivate the relay board
    setTimeout(function () {
      console.log("Releasing Garage Button");
      rpio.open(pinNumber, rpio.OUTPUT, rpio.LOW);
      rpio.write(pinNumber, rpio.HIGH);
      rpio.close(pinNumber);
    }, doorOpenButtonTimeout);

    //Notify HomeKit that the garage door is opening
    console.log("Garage Door is Opening");
    garage
      .getService(Service.GarageDoorOpener)
      .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
    GarageDoorAutoClose.doorState = Characteristic.CurrentDoorState.OPENING;

    //After doorOpeningTimeout has elapsed, notify HomeKit that the door is open
    setTimeout(function(){
      console.log("Garage Door is Open");
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
      GarageDoorAutoClose.doorState = Characteristic.CurrentDoorState.OPEN;
    }, doorOpeningTimeout);

    //After doorAutoCloseTimeout has elapsed, notify HomeKit that the door is closing
    setTimeout(function(){
      console.log("Garage Door is Closing");
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);

      //Notify HomeKit that the garage door is trying to close by setting the TargetDoorState to CLOSED
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
      GarageDoorAutoClose.doorState = Characteristic.CurrentDoorState.CLOSING;

      //After doorClosingTimeout has elapsed, notify HomeKit that the door is closed
      setTimeout(function(){
        console.log("Garage Door is Closed");
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
        GarageDoorAutoClose.doorState = Characteristic.CurrentDoorState.CLOSED;
      }, doorClosingTimeout);
    }, doorAutoCloseTimeout);
  },

  //This doesn't do anything because we can only control opening of the door
  close: function(garage) {
    console.log("Closing the Garage");
  },
  identify: function() {
    console.log("Identify the Garage");
  },
};

var garageUUID = uuid.generate('hap-nodejs:accessories:'+'GarageDoorAutoClose');
var garage = exports.accessory = new Accessory('Garage Gate', garageUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
garage.username = "C1:5D:3F:EE:5E:FA"; //edit this if you use Core.js
garage.pincode = "031-45-154";

garage
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Generic Garage")
  .setCharacteristic(Characteristic.Model, "Standard Model")
  .setCharacteristic(Characteristic.SerialNumber, "00000001");

garage.on('identify', function(paired, callback) {
  GarageDoorAutoClose.identify();
  callback();
});

//Trigger the open function when HomeKit sends the set command with a TargetDoorState of OPEN
garage
  .addService(Service.GarageDoorOpener, "Garage Door")
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      GarageDoorAutoClose.close(garage);
      callback();
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {
      GarageDoorAutoClose.open(garage);
      callback();
    }
  });

//Respond to queries from HomeKit for the garage door state
garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {
    var err = null;
    console.log("Query: What is door state?");
    console.log("Door is " + doorStateString[GarageDoorAutoClose.doorState]);
    callback(err, GarageDoorAutoClose.doorState);
  });

