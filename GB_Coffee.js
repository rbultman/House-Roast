// start the oven at a 200F Bake before running this code.

var greenBean = require("green-bean");
var PROFILE1 = [

  { temp: 240, duration: 300000 }, //preheat for 5 minutes.
  { temp: 200, duration:  60000 }, // dry the beans
  { temp: 340, duration: 420000 },
  { temp: 424, duration: 420000 },
  { temp: 434, duration:  60000 }, // get through first crack
  { temp: 400, duration: 180000 }, // back off after first crack

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



