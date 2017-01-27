# HAP-NodeJs-Accessories
Accessories I have created for HAP-NodeJs HomeKit Automation with a Raspberry Pi.

## GarageDoorAutoClose_accessory.js
This is a variation of [GarageDoorOpener_accessory.js](https://github.com/KhaosT/HAP-NodeJS/blob/master/accessories/GarageDoorOpener_accessory.js) for garage gates that open with a button press and automatically close after a set period of time. It also includes notifying HomeKit of the following garage door state: opening, open, closing, closed.

My apartment building has one of these kind of gates and I needed a way to handle the auto closing behavior.

The accessory is designed to be used with a relay board connected to a garage remote on the relay side, and Raspberry Pi GPIO pins on the signal side. I use a [SainSmart 2-channel relay](https://www.amazon.com/SainSmart-101-70-100-2-Channel-Relay-Module/dp/B0057OC6D8), but you can use any other relay board, just be aware of the polarity.

###Setup
Modify the pin settings in the GarageDoorAutoClose_accessory.js file to match your setup.

```
//Define the pin number for the relay GPIO
//the rpio module uses the physical numbering scheme
//Pin 16 is GPIO 23
var pinNumber = 16;
```

Then modify the variables for each of the timeouts:

```
//Time in milliseconds to hold the garage open signal
var doorOpenButtonTimeout = 3000;

//Time in milliseconds it takes for the door to open 
var doorOpeningTimeout = 10000;

//Time in milliseconds that the garage door will stay open after opening, and before automatically closing
var doorAutoCloseTimeout = 30000;

//Time in milliseconds it takes for the door to close 
var doorClosingTimeout = 10000;
```

You must also install the `rpio` package for this accessory to work.
Run the following in the root of your HAP-NodeJs directory to install `rpio`:

`npm install rpio`

## DimmableLED_accessory.js
This lets you set the brightness of an LED directly connected to a Raspberry Pi GPIO pin.

### Setup

Modify the pin settings in the DimmableLED_accessory.js file to match your setup.

```
//Define the pin number for the relay GPIO
//the pigpio module uses the GPIO numbering scheme
//GPIO 18 is Pin 12
var pinNumber = 18;
```

You must also install the `pigpio` package for this accessory to work.
Run the following in the root of your HAP-NodeJs directory to install `pigpio`:

`npm install pigpio`
