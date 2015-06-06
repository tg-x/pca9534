var I2c = require('i2c');

var CMD = {
    INPUT: 0x00,
    OUTPUT: 0x01,
    INVERSION: 0x02,
    CONFIGURE: 0x03,
};

var PCA9534 = function(device, address, pinConfig, pinState)
{
    this.io = new I2c(address, { device: device });
    this.configure(pinConfig || 0);
    this.write(pinState || 0);
}

PCA9534.prototype.getPin = function (pin)
{
    return new PCA9534.Pin(this, pin);
}

/**
 * Configure pins.
 *
 * @param pinConfig  8-bit configuration register
 *    Each bit corresponds to a pin, 0 sets the pin to output, 1 to input mode.
 */
PCA9534.prototype.configure = function (pinConfig)
{
    // configuration command
    this.io.writeBytes(CMD.CONFIGURE, [ pinConfig ], PCA9534.error);
    this.pinConfig = pinConfig;
}


/**
 * Set state of all pins.
 *
 * @param pinState  8-bit pin configuration.
 *    Each bit sets the logic level of the corresponding pin.
 */
PCA9534.prototype.write = function (pinState)
{
    this.io.writeBytes(CMD.OUTPUT, [ pinState ], PCA9534.error);
    this.pinState = pinState;
    var printf = require('printf');
    console.log(printf("pin state: %08b", pinState));
    // Need to reconfigure, otherwise further writes stop working after writing 1 followed 0 to pin 0
    this.configure(this.pinConfig);
};


/**
 * Set state of a given pin.
 *
 * @param pin    Pin number (0..7)
 * @param level  Logic level of pin (0 or 1)
 */
PCA9534.prototype.writePin = function (pin, level)
{
    console.log("write pin:", pin, level);
    var mask = 1 << pin;
    if (PCA9534.HIGH == level) {
	this.pinState |= mask;
    } else {
	this.pinState &= ~mask;
    }
    this.write(this.pinState);
};


PCA9534.prototype.getPinState = function ()
{
    return this.pinState;
};


PCA9534.error = function (err)
{
    if (null != err)
        console.error('PCA9534 error: ', err);
};


PCA9534.Pin = function(gpio, pin)
{
    this.gpio = gpio;
    this.pin = pin;
};

PCA9534.Pin.prototype.write = function (level)
{
    return this.gpio.writePin(this.pin, level);
};


PCA9534.HIGH = 1;
PCA9534.LOW = 0;

module.exports = PCA9534;
