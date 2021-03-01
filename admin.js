var pg = require('pg');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var pool = new pg.Pool(common.postgresConfig());

var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");

module.exports = function(app){
	
	app.get('/', urlencodedParser, function(req, res) {
		var webpage = adminPage;
	
		res.send(webpage);
	});	
}