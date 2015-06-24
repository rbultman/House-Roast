var NORMAL_PROFILE = [
  { temp: 200, duration: 5000 },
  { temp: 210, duration: 5000 },
  { temp: 220, duration: 3000 },
  { temp: 240, duration: 2000 },
  { temp: 260, duration: 3000 },
];

var SPEEDY_PROFILE = [
  { temp: 200, duration: 100 },
  { temp: 210, duration: 200 },
  { temp: 220, duration: 100 },
  { temp: 240, duration: 50 },
  { temp: 260, duration: 150 },
];

function startCooking(profile, callback, step) {
  var index = step || 0;
  var mode = profile[index];

  if (mode) {
    console.log('setting temp to ' + mode.temp);
    setInterval(console.log('keep it up!'), 1000);
    setTimeout(startCooking.bind(this, profile, callback, index + 1),
      mode.duration);
  }
  else {
    callback(null);
  }
}

startCooking(NORMAL_PROFILE, function(err) {
  if (err) console.error(err);
  else console.log('cool beans');
});
