var greenBean = require("green-bean");
var PID = .21; //This will be output from the PID function when it is created.
var period = 10000 //This is the period for one ON/OFF cycle of the element.
var OnTime = PID * period;
var OffTime = period - OnTime;

/*
var elementOn = function() {
	range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: 16
    	});
	setTimeout(elementOff,OnTime);
};

var elementOff = function() {
  	range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: 0
    	});
};
*/

greenBean.connect("range", function(range) {
    range.fctMode.write(1); // enter fct mode

    setInterval(function() {
        range.fctMode.write(1); // stay in fct mode
    }, 15000);

	
    range.elementStatus.subscribe(function(value) {
        console.log("element status changed:", value);
    });

    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 0,
        lowerOvenConvectionFanDrivePercentage: 100,
        lowerOvenConvectionFanRotation: 1
    });

    setInterval(function() {
	range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: 16
    	});
	setTimeout(function() {
		range.elementStatus.write({
       			upperOvenElementStatus: 0,
        		lowerOvenElementStatus: 0
    		});
	},OnTime);
    },period);	


//    setInterval(elementOn,period);

});


