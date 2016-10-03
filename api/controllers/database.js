'use strict';
const MongoClient = require('mongodb').MongoClient


module.exports = {
  connect:connect
};

function connect() {
	MongoClient.connect('mongodb://odyc3-db:27017/odyc3', (err, database) => {
  		if (err) return console.log(err);
  		console.log("we are connected");
	});
}