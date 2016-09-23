'use strict';

var util = require('util');
var mysql=require(__dirname+'/../../model/database');

module.exports = {
	signin: signin,
	logout: logout,
	getuserid: getuserid
};

function signin(req, res) {
	console.log("\n=======================================================================================\nCreate Session "+JSON.stringify(req.body));
	console.log("User Name :"+req.body.username);
	var username=req.body.username;
	if ((req.body.username !== undefined ) && (req.body.password !== undefined)) {
		mysql.connect(function(error,database) {
			if (error) {
				res.statusCode=500;
				var message={'message': 'can\'t connect to the database : '+error};
				res.json(message);
			} else {
				database.query("SELECT id, SHA2(CONCAT(NOW(),CONCAT('USERID:', CONCAT(id, CONCAT('-',rand())))), 256) as sessionid FROM user WHERE username=? and password=SHA2(?,256);", [req.body.username, req.body.password],function(err, result) {
					if (err) {
						res.statusCode=500;
						var message={'message': JSON.stringify(err)};
						res.json(message);
						console.log("Failed to check password: "+message);
						database.end();
					} else {
						if (result.length == 0) {
							res.statusCode=403;
							var message={'message': 'Unknown user or invalid password'};
							res.json(message);
							console.log('Unkown user');
							database.end();
						} else {
							var userid=result[0].id;
							var sessionid=result[0].sessionid;
							database.query("DELETE FROM session WHERE user_id=?;", [userid],function(err, result) {
								if (err) {
									res.statusCode=500;
									var message={'message': JSON.stringify(err)};
									res.json(message);
									console.log("Failed to delete existing session for user ("+userid+"): "+message);
									database.end();
								} else {
									database.query("INSERT INTO session (user_id, session, creation) VALUES (?,?, NOW())", [userid, sessionid],function(err, result) {
										if (err) {
											res.statusCode=500;
											var message={'message': JSON.stringify(err)};
											res.json(message);
											console.log("Failed to create session for user ("+userid+"): "+message);
											database.end();
										} else {
											console.log("Received response "+JSON.stringify(result));
											res.statusCode=200;
											console.log("Session created for user ("+userid+"): "+sessionid);
											var user = {
												id: userid,
												username: username,
												session: sessionid
											};
											console.log("User : "+JSON.stringify(user));
											res.json(user);
											database.end();
										}
									});
								}
							});
						}
					}
				});
			}
		});
	} else {
		res.statusCode=400;
		var message={'message': "BadRequest; missing parameters"};
		res.json(message);
	} 
}

function logout(req, res) {
	console.log("\n=======================================================================================\nLogout");

	/*for (var field in req) console.log("field "+field);
  	console.log("Received request body "+JSON.stringify(req.body));
	console.log("Received request req.swagger.params "+JSON.stringify(req.swagger.params));
	console.log("Received request query "+JSON.stringify(req.query));*/
	var sessionid=req.swagger.params.sessionid.value;
	console.log("SessionID :"+sessionid);
	mysql.connect(function(error,database) {
		if (error) {
			res.statusCode=500;
			var message={'message': 'can\'t connect to the database : '+error};
			res.json(message);
		} else {

			database.query("SELECT user_id, session FROM session WHERE session=?", [sessionid],function(err, result) {
				if (err) {
					res.statusCode=500;
					var message={'message': JSON.stringify(err)};
					res.json(message);
					console.log(message);
					database.end();
				} else {
					if (result.length==0) {
						res.statusCode=404;
						var message={'message': 'Session not found'};
						res.json(message);
						console.log(message);
						database.end();
					} else {
						var userid=result[0].user_id;
						database.query("DELETE FROM session WHERE session=?", [sessionid],function(err, result) {
							if (err) {
								res.statusCode=500;
								var message={'message': JSON.stringify(err)};
								res.json(message);
								console.log(message);
								database.end();
							} else {
								var user = {
									id: userid,
								};
								console.log("User : "+JSON.stringify(user));
								res.json(user);
								database.end();
							}
						});

					}
				}
			});
		}
	});
}


function getuserid(sessionid, database, callback) {
	database.query("SELECT user_id, session FROM session WHERE session=?", [sessionid],function(err, result) {
		if (err) {
			var message=JSON.stringify(err);
			console.log("Error retreaving userid for session "+sessionid+" : " + message);
			callback(500, message,false);
		} else {
			if (result.length==0) {
				var message="Session not found";
				console.log("Unkown session "+sessionid+" : " + message);
				callback(404, message,false);
			} else {
				var userid=result[0].user_id;
				callback(200, false,userid);
			}
		}
	});
}

