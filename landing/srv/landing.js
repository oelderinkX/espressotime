var pg = require('pg');
var express = require('express');
var common = require('../../common/srv/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var landingPage = fs.readFileSync(__dirname + "/../client/index.html", "utf8");

	app.get('/', urlencodedParser, function(req, res) {
			res.send(landingPage);
	});
}