var pg = require('pg');
//var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//var pool = new pg.Pool(common.postgresConfig());

var adminPage = fs.readFileSync(__dirname + "/webpage/admin.html", "utf8");

module.exports = function(app){
	app.post('/admin', urlencodedParser, function(req, res) {
		var webpage = adminPage;
	
		// if shop and password missing, just say you should go through other page and redirect to there

		res.send(webpage);
	});	
}