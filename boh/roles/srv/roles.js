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

	app.post('/updaterole', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
        var colour = req.body.colour;
		var textcolour = req.body.textcolour;
		var rights = req.body.rights;

        var sql = 'select id, name, colour, textcolour, rights from espresso.role where shopid = $1 order by id'

        var values = [];

        if (id == -1) {
            console.log('insert');
            sql = "insert into espresso.role (shopid, name, colour, textcolour, rights)";
            sql += " values ($1, $2, $3, $4, $5)";
			sql += " RETURNING id;";
            values = [shopId, name, colour, textcolour, rights];
        } else if (id > 0) {
            console.log('update');
            sql = "update espresso.role set name = $3, colour = $4, textcolour = $5, rights = $6 ";
            sql += " where shopid = $1 and id = $2";
            values = [shopId, id, name, colour, textcolour, rights];
        }

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();
			
				if (err) {
					console.log(err);
				}

				if (id == -1) {
					id = result.rows[0].id;
				}

				res.send({ result: 'success', roleid: id });
			});
		});
	});

	app.post('/deleterole', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;

        var sql = "delete from espresso.role where shopid = $1 and id = $2";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, id], function(err, result) {
				done();

				res.send({ result: 'success' });
			});
		});
	});
}