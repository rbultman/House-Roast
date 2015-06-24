var util = require('util');
var events = require('events');

var Elements = {
   NONE:       0,
   BAKE:       1,
   BROIL:      2,
   CONVECTION: 3,
};

function Roaster() {
  events.EventEmitter.call(this);
  this.elements = Elements.NONE;
}

util.inherits(Roaster, events.EventEmitter);

module.exports.Roaster = Roaster;
module.exports.Elements = Elements;
