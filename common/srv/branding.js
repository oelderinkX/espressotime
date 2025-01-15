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

            var css = getCachedBranding(shopid);
            if (css) {
                res.type('text/css');
                res.send(css);
            }

            var sql = 'select css from espresso.branding where shopid = $1';

            pool.connect(function(err, connection, done) {
                connection.query(sql, [shopid], function(err, result) {
                    done();

                    if (result && result.rowCount == 1) {
                        setCachedBranding(shopid, result.rows[0].css);
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

function getCachedBranding(shopid) {
    console.log('branding.css - getting cache');

    let now = new Date();

    for(let i = 0; i < cache_css.length; i++ ) {
        if (cache_css[i].shopid === shopid) {
            if (now < cache_css[i].expire) {
                console.log('branding.css - Cache Used!');
                return cache_css.css;
            }
        }
    }

    // lol, don't return for the undefine goodness!
}

function setCachedBranding(shopid, css) {
    console.log('branding.css - setting cache');

    // clear old cached css
    for(let i = 0; i < cache_css.length; i++ ) {
        cache_css = cache_css.filter(cache_css.shopid !== shopid);
    }

    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + 1);

    cache_css.push({
        shopid: shopid,
        css: css,
        expire: expire
    })
}

