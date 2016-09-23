'use strict';
var util = require('util');

module.exports = {
  play: play
};

function play(req, res) {
  console.log("Received"+JSON.stringify(req.body));
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var hello = util.format('OK');

  // this sends back a JSON response which is a single string
  res.json(hello);
}
