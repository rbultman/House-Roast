var greenBean = require("green-bean");
var prompt = require('prompt');
    prompt.start();

var period = 10000 //This is the period for one ON/OFF cycle of the element.
var element = 11; // 11 = Bake, 12 = Broil, 48 = Convect
var power = 0;
var promptPID = 0;

var PID = 0.01 * promptPID;
var OnTime = PID * period;
//var OffTime = period - OnTime;

var getInputs = function (power, element) {

        prompt.get(['power', 'element'], function (err, result) {

            if(result.power == 'exit') {
                       range.fctMode.write(0); // exit fct mode
            } else {
                    promptPID = parseInt(result.power);
                    element = parseInt(result.element)
                    console.log('  Power (0 to 100): ' + promptPID);
                    console.log('  Element (bake = 11, broil = 12, convect = 48): ' + element);
                    PID = 0.01 * promptPID;
                    OnTime = PID * period;
                    getInputs(power, element);         
              }
        });
};

greenBean.connect("range", function(range) {
    range.fctMode.write(1); // enter fct mode

    range.ovenLight.write(1); // turn on oven light

    setInterval(function() {
        range.fctMode.write(1); // stay in fct mode
    }, 15000);

    getInputs(power, element);

/*	
    range.elementStatus.subscribe(function(value) {
        console.log("element status changed:", value);
    });
*/

    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 0,
        lowerOvenConvectionFanDrivePercentage: 100,
        lowerOvenConvectionFanRotation: 0
    });

    setInterval(function() {
	    range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: element
    	});
        
	    setTimeout(function() {
		    range.elementStatus.write({
       			upperOvenElementStatus: 0,
        		lowerOvenElementStatus: 0
    	    });
	    },OnTime);
    },period);	


          


});


