var fs = require("fs");
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var adminPage = fs.readFileSync(__dirname + "/../client/admin.html", "utf8");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
	app.get('/admin', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(adminPage);
		} else {
			res.redirect(common.getLoginUrl('/admin'));
		}
	});

	app.post('/admin', urlencodedParser, function(req, res) {
		var identifier = req.body.identifier;
		var redirect = req.body.redirect;

		if (identifier) {
			res.cookie('identifier', identifier, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true });

			if (redirect) {
				res.redirect(redirect);
			} else {
				res.send(adminPage);
			}
		} else {
			res.redirect(common.getLoginUrl('/admin'));
		}
	});

	app.get('/logout', urlencodedParser, function(req, res) {
		res.cookie('identifier', '', { maxAge: 0, httpOnly: true });
		res.clearCookie('identifier');
		res.redirect(common.getLoginUrl());
	});
}