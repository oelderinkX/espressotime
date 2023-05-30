var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var rolesPage = fs.readFileSync(__dirname + "/../client/dailyreconciliation.html", "utf8");
	
	app.use('/scripts/dailyreconciliation.js', express.static(__dirname + '/../client/dailyreconciliation.js'));

	app.get('/dailyreconciliation', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
				var formatted = rolesPage;
				res.send(formatted);
		} else {
			res.redirect(common.getLoginUrl('/dailyreconciliation'));
		}
	});	

    app.post('/getreconciliation', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var recon_date = req.body.recon_date;
		
		var sql = 'select id, recon_date, cents_10, cents_20, cents_50, dollars_1, dollars_2, dollars_5, dollars_10, dollars_20, ';
		sql += 'dollars_50, dollars_100, cashout1, credittobank1, amex1, giftredeem1, gifttopup1, cashout2, credittobank2, ';
		sql += 'amex2, giftredeem2, gifttopup2, finalcash, finalmanualsmartpay, finalsmartpay ';
		sql += 'from espresso.reconciliation where shopid = $1 and recon_date = $2';

		pool.connect(function(err, connection, done) {
			connection.query(sql, [shopId, recon_date], function(err, result) {
				done();

				console.log(err);

				var recon = {};

				if (result && result.rowCount == 1) {
					recon = {	id: result.rows[0].id,
								recon_date: result.rows[0].recon_date,
                                cents_10: result.rows[0].cents_10,
                                cents_20: result.rows[0].cents_20,
                                cents_50: result.rows[0].cents_50,
								dollars_1: result.rows[0].dollars_1,
								dollars_2: result.rows[0].dollars_2,
								dollars_5: result.rows[0].dollars_5,
								dollars_10: result.rows[0].dollars_10,
								dollars_20: result.rows[0].dollars_20,
								dollars_50: result.rows[0].dollars_50,
								dollars_100: result.rows[0].dollars_100,
								cashout1: result.rows[0].cashout1,
								credittobank1: result.rows[0].credittobank1,
								amex1: result.rows[0].amex1,
								giftredeem1: result.rows[0].giftredeem1,
								gifttopup1: result.rows[0].gifttopup1,
								cashout2: result.rows[0].cashout2,
								credittobank2: result.rows[0].credittobank2,
								amex2: result.rows[0].amex2,
								giftredeem2: result.rows[0].giftredeem2,
								gifttopup2: result.rows[0].gifttopup2,
								finalcash: result.rows[0].finalcash,
								finalmanualsmartpay: result.rows[0].finalmanualsmartpay,
								finalsmartpay: result.rows[0].finalsmartpay
					};
				}
					
				res.send(recon);
			});
		});
	});

    app.post('/savereconciliation', jsonParser, function(req, res) {
		var shopId = common.getShopId(req.cookies['identifier']);
		var recon_date = req.body.recon_date;
		var cents_10 = req.body.cents_10;
        var cents_20 = req.body.cents_20;
		var cents_50 = req.body.cents_50;
		var dollars_1 = req.body.dollars_1;
		var dollars_2 = req.body.dollars_2;
		var dollars_5 = req.body.dollars_5;
        var dollars_10 = req.body.dollars_10;
		var dollars_20 = req.body.dollars_20;
		var dollars_50 = req.body.dollars_50;
		var dollars_100 = req.body.dollars_100;
		var cashout1 = req.body.cashout1;
        var credittobank1 = req.body.credittobank1;
		var amex1 = req.body.amex1;
		var giftredeem1 = req.body.giftredeem1;
		var gifttopup1 = req.body.gifttopup1;
		var cashout2 = req.body.cashout2;
        var credittobank2 = req.body.credittobank2;
		var amex2 = req.body.amex2;
		var giftredeem2 = req.body.giftredeem2;
		var gifttopup2 = req.body.gifttopup2;
		var finalcash = req.body.finalcash;
        var finalmanualsmartpay = req.body.finalmanualsmartpay;
		var finalsmartpay = req.body.finalsmartpay;

		sql = "INSERT INTO espresso.reconciliation ";
		sql += "(shopid, recon_date, cents_10, cents_20, cents_50, dollars_1, dollars_2, dollars_5, dollars_10, dollars_20, ";
		sql += "dollars_50, dollars_100, cashout1, credittobank1, amex1, giftredeem1, gifttopup1, cashout2, credittobank2, ";
		sql += "amex2, giftredeem2, gifttopup2, finalcash, finalmanualsmartpay, finalsmartpay) ";
		sql += "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) ";
		sql += "ON CONFLICT (recon_date) DO UPDATE SET shopid = $1, recon_date = $2, cents_10 = $3, cents_20 = $4, cents_50 = $5, ";
		sql += "dollars_1 = $6, dollars_2 = $7, dollars_5 = $8, dollars_10 = $9, dollars_20 = $10, ";
		sql += "dollars_50 = $11, dollars_100 = $12, cashout1 = $13, credittobank1 = $14, amex1 = $15, ";
		sql += "giftredeem1 = $16, gifttopup1 = $17, cashout2 = $18, credittobank2 = $19, ";
		sql += "amex2 = $20, giftredeem2 = $21, gifttopup2 = $22, finalcash = $23, finalmanualsmartpay = $24, finalsmartpay = $25;";
		var values = [	shopId, recon_date, cents_10, cents_20, cents_50, dollars_1, dollars_2, dollars_5, dollars_10,
					dollars_20, dollars_50, dollars_100, cashout1, credittobank1, amex1, giftredeem1, gifttopup1,
					cashout2, credittobank2, amex2, giftredeem2, gifttopup2, finalcash, finalmanualsmartpay, finalsmartpay ];

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();

				res.send({ result: 'success', err: err, result: result });
			});
		});
	});
}