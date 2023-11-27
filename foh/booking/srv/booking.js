var pg = require('pg');
var express = require('express');
var common = require('../../../common/srv/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var bookingPage = fs.readFileSync(__dirname + "/../client/booking.html", "utf8");

	app.get('/bookings', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(bookingPage);
		} else {
			res.redirect(common.getLoginUrl('/booking'));
		}
	});

	app.post('/getbookings', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);

		var sql = "select id, name, datetime, pax, phone, notes from espresso.booking where shopid = $1 order by datetime desc limit 100;";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var bookings = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						bookings.push({	id: result.rows[i].id,
										name: result.rows[i].name,
										datetime: result.rows[i].datetime,
                                        pax: result.rows[i].pax,
                                        phone: result.rows[i].phone,
                                        notes: result.rows[i].notes,
								    });
					}
				}
					
				res.send(bookings);
			});
		});
	});

	app.post('/updatebooking', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
        
		var id = req.body.id;
		var name = req.body.name;
        var datetime = req.body.datetime;
        var pax = req.body.pax;
        var phone = req.body.phone;
        var notes = req.body.notes;

        var values = [];

        if (id == 0) {
            console.log('insert');
			console.log(id);
            sql = "insert into espresso.booking (shopid, name, datetime, pax, phone, notes)";
            sql += " values ($1, $2, $3, $4, $5, $6) returning id";
            values = [shopId, name, datetime, pax, phone, notes];
        } else {
            console.log('update');
			console.log(id);
            sql = "update espresso.booking set name = $3, datetime = $4, pax = $5, phone = $6, notes = $7";
            sql += " where shopid = $1 and id = $2";
            values = [shopId, id, name, datetime, pax, phone, notes];
        }

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();
			
				if (result && result.rowCount == 1) {
					if (id == 0) {
						id = result.rows[0].id;
					}
				}

				res.send({ result: 'success', id: id });
			});
		});
	});
}