'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = express();
var SwaggerUI = require('swagger-tools/middleware/swagger-ui');

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};
app.use(express.static(__dirname+'/app'));
app.use(express.static(__dirname+'/gw'));

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  var optionui={
    apiDocs:'/api/api-docs',
  	swaggerUi:'/api/docs'
  }
  app.use(SwaggerUI( swaggerExpress.runner.swagger,optionui));


  // install middleware
  swaggerExpress.register(app);

  var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
  var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
  app.listen(server_port, server_ip_address, function () {
	 console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
  });
  
  
  //console.log("Environnement :"+JSON.stringify(process.env));

 /* if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }*/
});