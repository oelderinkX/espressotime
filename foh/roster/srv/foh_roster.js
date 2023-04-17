var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var rosterPage = fs.readFileSync(__dirname + "/../client/roh_roster.html", "utf8");
	
	app.use('/scripts/roh_roster.js', express.static(__dirname + '/../client/roh_roster.js'));

	app.get('/roh_roster', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		var date = req.query.date || '';

		if (shopid && shopid != -1) {
            var formatted = rosterPage;
            formatted = formatted.replace('getRosterDates();', 'getRosterDates(' + date + ');');
            res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/roh_roster'));
		}
	});	
}