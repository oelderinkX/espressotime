var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('./common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var basic_css = fs.readFileSync(__dirname + "/../css/basic.css", "utf8");
	
	app.get('/branding.css', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
            var sql = 'select css from espresso.branding where shopid = $1';

            pool.connect(function(err, connection, done) {
                connection.query(sql, [shopid], function(err, result) {
                    done();

                    if (result && result.rowCount == 1) {
                        res.type('text/css');
                        res.send(result.rows[0].css);
                    }  else {
                        res.type('text/css');
                        res.send(basic_css);
                    }
                });
            });
		} else {
            res.type('text/css');
			res.send(basic_css);
		}
	});	
}