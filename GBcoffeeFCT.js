// start the oven at a 190F Convect Bake before running this code.

var greenBean = require("green-bean");
var offset = 20;
var startTemp = 200; //The temperature needed to start the cycle.

var PROFILE1 = [
  { temp: 240, duration: 300000 }, //preheat for 5 minutes.
  { temp: 200, duration:  60000 }, // dry the beans
  { temp: 340, duration: 420000 },
  { temp: 424, duration: 420000 },
  { temp: 434, duration:  60000 }, // get through first crack
  { temp: 400, duration: 180000 }, // back off after first crack
];

var compareTemp = function(range,tempRTD, tempSet) {
        tempSet = tempSet + offset; //add the offset from RTD to Center of oven.
        range.analogInputs.read(function(value) {
          tempRTD = value.lowerOvenRtd;
          console.log("Lower Oven RTD is:", tempRTD, "F");
        });
          
        if(tempRTD < tempSet) {
            console.log("turn oven ON");

            range.elementStatus.write({
              upperOvenElementStatus: 0,
              lowerOvenElementStatus: 51
            });
        } else if (tempRTD > tempSet) {
              console.log("turn oven OFF");
              range.elementStatus.write({
               upperOvenElementStatus: 0,
               lowerOvenElementStatus: 0
              });
            }
};

function startFan(range, power, direction) {
    var pwr = power;
    var fandir = direction;
    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 1,
        lowerOvenConvectionFanDrivePercentage: pwr,
        lowerOvenConvectionFanRotation: fandir
    });
}

function startCooking(range, profile, callback, step) {
  var index = step || 0;
  var setpoint = profile[index];
  var hysteresis = 1;
  var tempNow = 0;

  if (setpoint) {
        console.log('setting temp to ' + setpoint.temp);
//    range.analogInputs.read(function(value) {
//	        tempNow = value.lowerOvenRtd;
//          console.log("Lower Oven RTD is:", tempNow, "F");
         setInterval(compareTemp(range, tempNow, setpoint.temp), 2000);
//          setTimeout(compareTemp(range, tempNow, setpoint.temp),100);		
         setTimeout(startCooking.bind(this, range, profile, callback, index + 1),
            setpoint.duration);
    
  } else {
    	range.elementStatus.write({
    		upperOvenElementStatus: 0,
    		lowerOvenElementStatus: 0});
    	callback(null);
  }
};

greenBean.connect("range", function(range) {

    range.fctMode.write(1); // enter fct mode

    setInterval(function() {
        range.fctMode.write(1); // stay in fct mode
    }, 15000);
    
    setInterval(function() {
        startFan(range, 100, dir); // start fan with specified direction
        setTimeout(function() {
          startFan(range, 0, dir);
        }, 20000); // after 20 seconds, turn off fan
        dir = !dir; // reverse direction for next time
    }, 25000);

    startCooking(range, PROFILE1, function(err) {
      if (err) console.error(err);
      else {
        console.log('cool beans');
        range.buzzerTone.write(5);
      }
    });
});
