var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var rosterPage = fs.readFileSync(__dirname + "/../client/roster.html", "utf8");
	var rosterDayPage = fs.readFileSync(__dirname + "/../client/rosterday.html", "utf8");
	
	app.use('/scripts/roster.js', express.static(__dirname + '/../client/roster.js'));
	app.use('/scripts/roster_day.js', express.static(__dirname + '/../client/roster_day.js'));

	app.get('/roster', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		var view = req.query.view || 'week';
		var date = req.query.date || '';

		if (shopid && shopid != -1) {
			if (view == 'week') {
				var formatted = rosterPage;
				formatted = formatted.replace('getRosterDates();', 'getRosterDates(' + date + ');');
				res.send(formatted);
			} else {
				var formatted = rosterDayPage;
				formatted = formatted.replace('getRosterDate();', 'getRosterDate(' + date + ');');
				res.send(formatted);
			}
		} else {
			res.redirect(common.getLoginUrl('/roster'));
		}
	});	

	app.post('/getroles', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		
		var sql = 'select id, name, colour, textcolour, rights from espresso.role where shopid = $1 order by id'

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var roles = [];
				roles.push({ id: 0, 
                             name: '-', 
                             colour: '#FFFFFF', 
                             textcolour: '#000000', 
                             rights: 0
                });

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						roles.push({ id: result.rows[i].id,
									 name: result.rows[i].name,
                                     colour: result.rows[i].colour,
                                     textcolour: result.rows[i].textcolour,
                                     rights: result.rows[i].rights
						});
					}
				}
					
				res.send(roles);
			});
		});
	});
}