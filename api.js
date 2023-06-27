var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('./common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var apiPage = fs.readFileSync(__dirname + "/api.html", "utf8");

	app.get('/api*', urlencodedParser, function(req, res) {
        if (req.url.includes('/api/status')) {
            res.send(apiPage);
        } else {
            console.log(req.url);
            console.log(req.param);
            res.send('{}');
        }
    });	

	app.post('/api*', urlencodedParser, function(req, res) {
        console.log(req.url);
        console.log(req.param);
        res.send('{}');
    });	
}