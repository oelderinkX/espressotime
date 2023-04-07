var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');
var pool = new pg.Pool(common.postgresConfig());

var editTimesPage = fs.readFileSync(__dirname + "/../client/edittimes.html", "utf8");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
	app.get('/edittimes', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);

		if (shopid && shopid != -1) {
			res.send(editTimesPage);
		} else {
			res.redirect(common.getLoginUrl('/edittimes'));
		}
	});

	app.post('/updatetimes', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var employeeid = req.body.employeeid;

		var starttime_rowid = req.body.starttime_rowid;
		var new_starttime = req.body.new_starttime;

		var finishtime_rowid = req.body.finishtime_rowid;
		var new_finishtime = req.body.new_finishtime;

		var startsql = "update espresso.start_finish set starttime = $1 where id = $2 and employeeid = $3";
		var finishsql = "update espresso.start_finish set finishtime = $1 where id = $2 and employeeid = $3";

		pool.connect(function(err, connection, done) {
			connection.query(startsql, [new_starttime, starttime_rowid, employeeid], function(err, result) {
				done();

				pool.connect(function(err, connection, done) {
					connection.query(finishsql, [new_finishtime, finishtime_rowid, employeeid], function(err, result) {
						done();

						res.send({success: true});
					});
				});
			});
		});
	});

	app.post('/updatebreaks', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']); // not used, so a bit dangerous

		var rowid = req.body.rowid;
		var employeeid = req.body.employeeid;
		var starttime = req.body.starttime;
		var new_finishtime = req.body.new_finishtime;
		var type = req.body.type;

		var sql = "update espresso.break set starttime = $1, finishtime = $2, breaktype = $3 where id = $4 and employeeid = $5";

		pool.connect(function(err, connection, done) {
			connection.query(sql, [starttime, new_finishtime, type, rowid, employeeid], function(err, result) {
				done();

				res.send({success: true});
			});
		});
	});
};