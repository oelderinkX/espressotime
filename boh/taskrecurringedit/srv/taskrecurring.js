var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var taskRecurringEditPage = fs.readFileSync(__dirname + "/../client/taskrecurringedit.html", "utf8");
	
	app.use('/scripts/taskrecurringedit.js', express.static(__dirname + '/../client/taskrecurringedit.js'));

	app.get('/taskrecurringedit', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
				var formatted = taskRecurringEditPage;
				res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/taskrecurringedit'));
		}
	});	

	app.post('/getallrecurringtasks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var showdisabled = req.body.showdisabled;

		var disabledsql = ' and recur <> -1 ';
		if (showdisabled) {
			disabledsql = ' ';
		}

		var sql = 'select id, description, name, recur, inputtype from espresso.recurring_task where shopid = $1' + disabledsql + 'order by id';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId], function(err, result) {
				done();

				var tasks = [];

				if (result && result.rowCount > 0) {
					for(var i = 0; i < result.rowCount; i++) {
						tasks.push({ id: result.rows[i].id,
									 name: result.rows[i].name,
                                     description: result.rows[i].description,
                                     recur: result.rows[i].recur,
                                     inputtype: result.rows[i].inputtype
						});
					}
				}
					
				res.send(tasks);
			});
		});
	});

	app.post('/updaterecurringtask', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var id = req.body.id;
		var name = req.body.name;
        var description = req.body.description;
		var recur = req.body.recur;
		var inputtype = req.body.inputtype;

        var sql = 'select id, description, name, recur, inputtype from espresso.recurring_task where shopid = $1 order by id'

        var values = [];

        if (id == -1) {
            console.log('insert');
            sql = "insert into espresso.recurring_task (shopid, name, description, recur, inputtype)";
            sql += " values ($1, $2, $3, $4, $5)";
			sql += " RETURNING id;";
            values = [shopId, name, description, recur, inputtype];
        } else if (id > 0) {
            console.log('update');
            sql = "update espresso.recurring_task set name = $3, description = $4, recur = $5, inputtype = $6";
            sql += " where shopid = $1 and id = $2";
            values = [shopId, id, name, description, recur, inputtype];
        }

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();
			
				if (err) {
					console.log(err);
					res.send({ result: 'fail', err: err });
				} else {
					if (id == -1) {
						id = result.rows[0].id;
					}

					res.send({ result: 'success', taskid: id });
				}
			});
		});
	});
}