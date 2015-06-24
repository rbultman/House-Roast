var SPI = require('pi-spi');

var spi0 = SPI.initialize("/dev/spidev0.0");
var spi1 = SPI.initialize("/dev/spidev0.1");

spi0.clockSpeed(1e6);
spi1.clockSpeed(1e6);

function readTc(spi, callback) {
spi.read(4, function(err, data) {
  if(err) {
    console.log("Error reading from SPI port. " + err);
    callback();
  }

  var buf = new Buffer(data);
  var reading = {};

  var temp = buf.readInt16BE(0)/16;
  var hundreths = ((data[1] >> 2) & 0x03) * 0.25;
  temp = temp + hundreths;

  reading.tempC = temp;
  reading.tempF = (temp * 9 / 5) + 32;

  reading.fault = data[1] & 0x01;
  reading.scvFault = (data[3] & 0x04)>>2;
  reading.scgFault = (data[3] & 0x02)>>1;
  reading.ocFault = data[3] & 0x01;

  var refHunds = (buf.readInt8(3) / 16) * 0.0625;
  var refTemp = buf.readInt8(2) + refHunds;

  callback(reading);
});
}

function printReading(reading) {
  if (reading.fault != 0) {
    if (reading.scvFault != 0) {
      console.log("Thermocouple short circuit to VCC detected.");
    }
    if (reading.scgFault != 0) {
      console.log("Thermocouple short circuit to GND detected.");
    }
    if (reading.ocFault != 0) {
      console.log("Thermocouple open fault detected.");
    }
  } else {
    console.log("Temp F: " + reading.tempF.toFixed(1));
    console.log("Temp C: " + reading.tempC.toFixed(1));
  }

}

readTc(spi0, function(reading){
  printReading(reading);
});

readTc(spi1, function(reading){
  printReading(reading);
});

setInterval(function() {
  readTc(spi0, function(reading) {
    printReading(reading);
  });
}
, 2000);

