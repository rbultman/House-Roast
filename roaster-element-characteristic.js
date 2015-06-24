var util = require('util');
var bleno = require('bleno');
var roaster = require('./roaster');

function RoasterElementCharacteristic(roaster) {
  bleno.Characteristic.call(this, {
     uuid: 'e15a5e7f79f14347b189d5fad26d0001',
     properties: ['read', 'write'],
     descriptors: [
     new bleno.Descriptor({
        uuid: '2901',
     value: 'Gets or sets the element to turn on.'
     })
  ]
  });

  this.roaster = roaster;
}

util.inherits(RoasterElementCharacteristic, bleno.Characteristic);

RoasterElementCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  }
  else if (data.length !== 1) {
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  }
  else {
    var element = data.readUInt8(0);
    switch (element) {
      case roaster.Elements.NONE:
      case roaster.Elements.BAKE:
      case roaster.Elements.BROIL:
      case roaster.Elements.CONVECTION:
         console.log("Element set to " + element);
        this.roaster.elements = element;
        callback(this.RESULT_SUCCESS);
        break;
      default:
        callback(this.RESULT_UNLIKELY_ERROR);
        break;
    }
  }
};

RoasterElementCharacteristic.prototype.onReadRequest = function(offset, callback) {
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG, null);
  }
  else {
    var data = new Buffer(1);
    data.writeUInt8(this.roaster.elements, 0);
    callback(this.RESULT_SUCCESS, data);
  }
};

module.exports = RoasterElementCharacteristic;
