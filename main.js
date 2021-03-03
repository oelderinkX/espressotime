var pg = require('pg');
//var common = require('./script/common.js');
var bodyParser = require('body-parser');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//var pool = new pg.Pool(common.postgresConfig());

var mainPage = fs.readFileSync(__dirname + "/webpage/main.html", "utf8");

module.exports = function(app){
	app.get('/', urlencodedParser, function(req, res) {
		var webpage = mainPage;
	
		res.send(webpage);
	});	
	
	app.post('/getemployees', urlencodedParser, function(req, res) {
		var shopId = req.body.shopId;
		var pass = req.body.pass;
		
		var employees = [ { "name": "Bob" }, { "name": "Slob" } ];
		
		res.send(employees);
	});
}