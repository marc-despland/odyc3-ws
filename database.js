var mysql = require('mysql');
//var config= require('konphyg')(__dirname+"/../appconfig");

module.exports= {
	connect: function(callback) {
		var config={
			"host": "localhost",
			"user": "voxgenie", 
			"password": "conceptu",
			"database": "voxgenie"
		};

		if (process.env.OPENSHIFT_MYSQL_DB_HOST) {
			console.log("We are on openshift !!! ");
			config.host=process.env.OPENSHIFT_MYSQL_DB_HOST;
			config.user=process.env.OPENSHIFT_MYSQL_DB_USERNAME;
			config.password=process.env.OPENSHIFT_MYSQL_DB_PASSWORD;
			config.database=process.env.OPENSHIFT_APP_NAME;
			config.port=process.env.OPENSHIFT_MYSQL_DB_PORT;
		}
		console.log("Database configuration : "+JSON.stringify(config));

		var mySqlClient = mysql.createConnection(config);
		mySqlClient.connect(function(err) {
			if (err) {
				console.log("Can't connect to the database :" +JSON.stringify(err));
				callback(err,false);
			} else {
				callback(false,mySqlClient);
			}
		});
	}

};

