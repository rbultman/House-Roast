var greenBean = require("green-bean");

greenBean.connect("range", function(range) {
    range.fctMode.write(0); // enter fct mode
});
