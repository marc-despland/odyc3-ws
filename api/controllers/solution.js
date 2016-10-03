'use strict';
var util = require('util');
const MongoClient = require('mongodb').MongoClient;

module.exports = {
  status: status,
  play: play,
  winner: winner
};


//var mogodburl="mongodb://odyc3:odyc3pwd@odyc3-db:27017/odyc3";

function mogodburl() {
	var url="mongodb://";
	var mongo_port = process.env.MONGODB_PORT || 27017;
	var mongo_address = process.env.MONGODB_ADDRESS || 'database';
	var mongo_user = process.env.MONGODB_USER || '';
	var mongo_passwd = process.env.MONGODB_PASSWD || '';
	var mongo_database = process.env.MONGODB_DATABASE || 'odyc3';
	if (mongo_user === '') {
		url += mongo_address +':'+mongo_port+'/'+mongo_database;
	} else {
		url += mongo_user+':'+mongo_passwd+'@'+mongo_address +':'+mongo_port+'/'+mongo_database;
	}
	return url;
}

function checkdb(db, callback) {
	db.listCollections({name: 'response'}).toArray((err, items) => {
		if (items.length==1) {
			console.log("Collection response found");
			callback(false, db.collection('response'));
		} else {
			console.log("Collection response NOT found");
			db.createCollection('response', (err, collection) => {
				console.log("Collection response created");
				collection.createIndex({ "email": 1 }, { unique: true });
				console.log("Index created");
				callback(false, collection);
			});
		}
	});
}

function checkResult(result) {
	var res=true;
	if (result.length==9) {
		if (res && result[0]!=6) res=false;
		if (res && result[1]!=3) res=false;
		if (res && result[2]!=9) res=false;
		if (res && result[3]!=1) res=false;
		if (res && result[4]!=8) res=false;
		if (res && result[5]!=2) res=false;
		if (res && result[6]!=4) res=false;
		if (res && result[7]!=5) res=false;
		if (res && result[8]!=7) res=false;
	} else {
		res=false;
	}
	return res;
}

function status(req, res) {
	MongoClient.connect(mogodburl(), (err, database) => {
		if (err) {
			console.log(err);
			res.statusCode=500;
			var status={"status": "ERROR", "database" : "ERROR"};
			res.json(status);
		} else {
			console.log("we are connected");
			res.statusCode=200;
			var status={"status": "OK", "database" : "OK"};
			database.close();
			console.log(status);
			res.json(status);
		}
	});
}		



function winner(req, res) {
	MongoClient.connect(mogodburl(), (err, database) => {
		if (err) {
			console.log(err);
			res.statusCode=500;
			var message={'message': 'We have a database issue'};
			res.json(message);
		} else {
			console.log("we are connected");
			database.collection('response').find().sort({rand:1}).limit(1).toArray(function(err, result) {
				console.log(err);
				console.log("we have found "+result.length+ " results");
				console.log(result);
				database.close();
				var message={'winner': result[0].email};
				console.log(message);
				res.json(message);
			});
		}
	});
}		

function play(req, res) {
	if (checkResult(req.body.play)) {
		MongoClient.connect(mogodburl(), (err, database) => {
			if (err) {
				console.log(err);
				res.statusCode=500;
				var message={'message': 'We have a database issue'};
				res.json(message);
			} else {
				console.log("we are connected");
				checkdb(database, (err, collection) => {
					console.log("collection created");	
					console.log("Received"+JSON.stringify(req.body));
					var solution={};
					solution.email=req.body.email;
					solution.rand=Math.random();
					//collection.updateOne({"email": req.body.email} , solution, {upsert:true, w: 1}, (err, result) => {
					collection.insertOne(solution, (err, result) => {
						if (err) {
							/*if (err.code==11000) {
								console.log('duplicate key');
							} else {*/
								database.close();
								console.log(err);
								res.statusCode=500;
								var message={'message': 'We have a database issue'};
								res.json(message);
							//}
						} else {
							database.close();
							console.log('saved to database');
							var message={'good': true};
							res.json(message);
						}
					});
				});
			}
		});
	} else {
		console.log('Wrong answer');
		var message={'good': false};
		res.json(message);
	}
}
