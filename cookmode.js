// start the oven at a 200F Bake before running this code.

var greenBean = require("green-bean");
var PROFILE1 = [
 
  { temp: 240, duration: 300000 },  //preheat to account for door opening.
  { temp: 200, duration: 120000 },  //dry the beans before ramping up.  
  { temp: 340, duration: 420000 },  
  { temp: 424, duration: 420000 },
  { temp: 434, duration: 120000 },
  { temp: 400, duration: 120000 },

];

function startCooking(range, profile, callback, step) {
  var index = step || 0;
  var setpoint = profile[index];

  if (setpoint) {
    console.log('setting temp to ' + setpoint.temp);
	  range.lowerOven.cookMode.write({
		mode: 27,
		cookTemperature: setpoint.temp,
		cookHours: 0,
		cookMinutes: 0
	    });

    setTimeout(startCooking.bind(this, range, profile, callback, index + 1),
      setpoint.duration);
  }
  else {
    callback(null);
  }
}

greenBean.connect("range", function(range) {
  startCooking(range, PROFILE1, function(err) {
    if (err) console.error(err);
    else console.log('cool beans');
  });
});



