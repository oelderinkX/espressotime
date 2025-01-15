var fs = require("fs");
var pg = require('pg');
var bodyParser = require('body-parser');
var common = require('./common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var pool = new pg.Pool(common.postgresConfig());

let cache_css = [];

module.exports = function(app) {
	var basic_css = fs.readFileSync(__dirname + "/../css/basic.css", "utf8");
	
	app.get('/branding.css', urlencodedParser, function(req, res) {
		var shopid = common.getShopId(req.cookies['identifier']);
		
		if (shopid && shopid != -1) {
            let css = getCachedBranding(shopid);
            if (css !== null) {
                res.type('text/css');
                res.send(css);
            } else {
                var sql = 'select css from espresso.branding where shopid = $1';

                pool.connect(function(err, connection, done) {
                    connection.query(sql, [shopid], function(err, result) {
                        done();

                        if (result && result.rowCount == 1) {
                            setCachedBranding(shopid, result.rows[0].css);
                            res.type('text/css');
                            res.send(result.rows[0].css);
                        }  else {
                            setCachedBranding(shopid, basic_css);
                            res.type('text/css');
                            res.send(basic_css);
                        }
                    });
                });
            }
        } else {
            res.type('text/css');
            res.send(basic_css);
        }
	});	
}

function getCachedBranding(shopid) {
    let now = new Date();

    for(let i = 0; i < cache_css.length; i++ ) {
        if (cache_css[i].shopid === shopid) {
            if (now < cache_css[i].expire) {
                return cache_css[i].css;
            }
        }
    }

    return null;
}

function setCachedBranding(shopid, css) {
    // clear old cached css
    for(let i = 0; i < cache_css.length; i++ ) {
        cache_css = cache_css.filter(c => c.shopid !== shopid);
    }

    // cache expires after 30 minutes
    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + 30);

    cache_css.push({
        shopid: shopid,
        css: css,
        expire: expire
    })
}

