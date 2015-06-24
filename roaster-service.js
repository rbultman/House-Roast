var util = require('util');
var bleno = require('bleno');

var RoasterElementCharacteristic = require('./roaster-element-characteristic');

function RoasterService(roaster) {
    bleno.PrimaryService.call(this, {
        uuid: 'e15a5e7f79f14347b189d5fad26dc603',
        characteristics: [
            new RoasterElementCharacteristic(roaster)
        ]
    });
}

util.inherits(RoasterService, bleno.PrimaryService);

module.exports = RoasterService;
