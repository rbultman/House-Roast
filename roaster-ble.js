var util = require('util');

//
// Require bleno peripheral library.
// https://github.com/sandeepmistry/bleno
//
var bleno = require('bleno');

//
// Roaster
// * has elements
//
var Roaster = require('./roaster');

//
// The BLE Roaster Service!
//
var RoasterService = require('./roaster-service');

//
// A name to advertise our Roaster Service.
//
var name = 'HouseRoaster';
var roaster = new Roaster.Roaster();
var roasterService = new RoasterService(roaster);

//
// Wait until the BLE radio powers on before attempting to advertise.
// If you don't have a BLE radio, then it will never power on!
//
bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    //
    // We will also advertise the service ID in the advertising packet,
    // so it's easier to find.
    //
    bleno.startAdvertising(name, [roasterService.uuid], function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
  else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(err) {
  if (!err) {
    console.log('advertising...');
    //
    // Once we are advertising, it's time to set up our services,
    // along with our characteristics.
    //
    bleno.setServices([
      roasterService
    ]);

    console.log("roasterService: " + JSON.stringify(roasterService));
    console.log("Elements: " + roaster.elements);
    setInterval(function() {
      roaster.elements++;
      if (roaster.elements > 255) {
         roaster.elements = 0;
      }
    }, 1000);
  }
});
