// start the oven at a 190F Convect Bake before running this code.

var greenBean = require("green-bean");
var period = 5000;
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
        if(tempRTD < tempSet) {
            console.log("turn oven ON");

            range.elementStatus.write({
              upperOvenElementStatus: 0,
              lowerOvenElementStatus: 63
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


function preHeat(range, reqtemp, xlfile, data_x) {
    
    var d_x = data_x;
    
    console.log("turn oven ON");
    
    range.elementStatus.write({
        upperOvenElementStatus: 0,
        lowerOvenElementStatus: 51
    });
    // run oven until the temp meets the required temperature.
    do {

        range.analogInputs.read(function(value) {
              temp = value.lowerOvenRtd;
              console.log("Lower Oven RTD is:", temp, "F");
              //xlfile.ActiveSheet.Cells(1, d_x).Value = temp;
              d_x++;
            }); // turn on oven and record values
        setTimeout(console.log("Lower Oven RTD is:", temp, "F"), 2000); // wait 2 seconds between read
    } while ( temp < reqtemp)
        
    return d_x; // return last stopping place in the data
};

function startCooking(range, profile, callback, xlfile, data_x, step) {
  var index = step || 0;
  var setpoint = profile[index];
  var hysteresis = 1;
  var tempNow = 0;
  var Path = ""; // fill in with path to the excel file, including name
  var d_x = data_x;
  if (setpoint) {
    console.log('setting temp to ' + setpoint.temp);
    range.analogInputs.read(function(value) {
          tempNow = value.lowerOvenRtd;
          console.log("Lower Oven RTD is:", tempNow, "F");
          //xlfile.ActiveSheet.Cells(1, d_x).Value = tempNow;
          d_x++;
          setTimeout(compareTemp(range, tempNow, setpoint.temp),100);		
	   });

          setTimeout(startCooking.bind(this, range, profile, callback, index + 1),
            setpoint.duration); // recursive?
      //xlfile.SaveAs(Path); // might need to initalize excel before this application and close everything outside
    
  } else {
    	range.elementStatus.write({
    		upperOvenElementStatus: 0,
    		lowerOvenElementStatus: 0});
    	callback(null);
  }
};

greenBean.connect("range", function(range) {

    var dir = 0; // fan direction set to reverse
    range.fctMode.write(1); // enter fct mode
    var xlapp = new ActiveXObject("Excel.Application"); // open excel application, I think it's needed to write a sheet
    var xlfile = new ActiveXObject("Excel.Sheet"); // native to windows, but apparently no other way to write files
    var data_x = 0; // set x index to last break in the data.
    xlfile.Application.Visible = true;
    data_x = preHeat(range, 200, xlfile, data_x);
    setInterval(function() {
        range.fctMode.write(1); // stay in fct mode
    }, 15000);
    
    //xlfile.ActiveSheet.Cells(1, d_x++).Value = "PreHeat finished."; // mark end to preheat cycle
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
    }, xlfile, data_x);
});
