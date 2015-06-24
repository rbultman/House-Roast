// start the oven at a 190F Convect Bake before running this code.

var greenBean = require("green-bean");
var offset = -10;
var startTemp = 200; //The temperature needed to start the cycle.
var dir = 0;
var tempNow = 0;
var hysteresis = 3;

var PROFILE1 = [
 { temp: 240, duration: 300000 }, //preheat for 15 minutes.
 { temp: 200, duration:  60000 }, // dry the beans
 { temp: 340, duration: 420000 },
 { temp: 424, duration: 420000 },
 { temp: 434, duration: 120000 }, // get through first crack
 { temp: 400, duration: 180000 }, // back off after first crack

/*
  { temp: 200, duration: 360000 },
  { temp: 450, duration: 900000 },
  { temp: 100, duration: 25000 },
  { temp: 150, duration: 15000 }, */
 
];

var readTemp = function(range) {
          range.analogInputs.read(function(value) {
              tempNow = value.lowerOvenRtd;
              console.log("Lower Oven RTD is:", tempNow, "F");
          });
}


var compareTemp = function(range,tempRTD, tempSet) {
        var tempSetOn = tempSet + offset; //add the offset from RTD to Center of oven.
        var tempSetOff = tempSetOn - hysteresis; //establish hysteresis for the oven.
        console.log("tempSetOn = ", tempSetOn);
        console.log("tempSetOff = ", tempSetOff);

        if(tempRTD < tempSetOn) {
            console.log("turn oven ON");     
            //console.log("RTD is " + tempRTD);
            range.elementStatus.write({       // 11 turns on the bake with 1/4 broil.
              upperOvenElementStatus: 0,      // 48 turns on the Convect
              lowerOvenElementStatus: 12      // 12 turns on Broil
            });
        } else if (tempRTD > tempSetOff) {
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
 

  clearInterval(compTempID);

  if (setpoint) {
        console.log('setting temp to ' + setpoint.temp);

          var compTempID = setInterval(function() {
              readTemp(range);
              setTimeout(function(){
                  compareTemp(range, tempNow, setpoint.temp)
              }, 1000);
          }, 2000);

          setTimeout(function(){
              clearInterval(compTempID);
          }, (setpoint.duration-500));

          setTimeout(startCooking.bind(this, range, profile, callback, index + 1), setpoint.duration);  
              
  } else {

    	range.elementStatus.write({
    		upperOvenElementStatus: 0,
    		lowerOvenElementStatus: 0});
    	callback(null);
  }
};

greenBean.connect("range", function(range) {
/*    range.lowerOven.userTemperatureOffset.read(function(value) {
        console.log("The Lower Oven user temperature offset is:", value);
        offset = value;
    }); */

    range.fctMode.write(1); // enter fct mode after assigning the Offset.

    var keepFCT = setInterval(function() {
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
        clearInterval(keepFCT);
        range.fctMode.write(0); // exit fct mode

      }
    });
});
