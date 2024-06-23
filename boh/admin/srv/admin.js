var fs = require("fs");
var bodyParser = require('body-parser');
var common = require('../../../common/srv/common.js');

var adminPage = fs.readFileSync(__dirname + "/../client/admin.html", "utf8");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
	app.all('/admin', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
			res.send(adminPage);
		} else {
			res.redirect(common.getLoginUrl('/admin'));
		}
	});
}