var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var rolesPage = fs.readFileSync(__dirname + "/../client/roles.html", "utf8");
	
	app.use('/scripts/roles.js', express.static(__dirname + '/../client/roles.js'));

	app.get('/roles', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
				var formatted = rolesPage;
				//formatted = formatted.replace('getRosterDate();', 'getRosterDate(' + date + ');');
				res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/roles'));
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