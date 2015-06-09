var greenBean = require("green-bean");
var PID = .3;
var period = 10000 //This is the period for one ON/OFF cycle of the element.

greenBean.connect("range", function(range, PID) {
    range.fctMode.write(1); // enter fct mode

    setInterval(function() {
        range.fctMode.write(1); // stay in fct mode
    }, 15000);

    var OnTime = PID * period;
    var OffTime = period - OnTime;
	
    range.elementStatus.subscribe(function(value) {
        console.log("element status changed:", value);
    });

    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 0,
        lowerOvenConvectionFanDrivePercentage: 100,
        lowerOvenConvectionFanRotation: 1
    });

    setInterval(function(period){
    	range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: 16
    	});
	
	setTimeout(function(OffTime){
    		range.elementStatus.write({
       			upperOvenElementStatus: 0,
        		lowerOvenElementStatus: 0
    		});
    	},OnTime);
    },period);

});


