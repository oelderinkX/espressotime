var fs = require("fs");
var pg = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
var common = require('./common/srv/common.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var pool = new pg.Pool(common.postgresConfig());

module.exports = function(app) {
	var apiPage = fs.readFileSync(__dirname + "/api.html", "utf8");

	app.get('/api*', urlencodedParser, function(req, res) {
        if (req.url.includes('/api/status')) {
            var sql = 'select id, request_time, method, url, data from espresso.api order by id desc limit 100'

            pool.connect(function(err, connection, done) {
                connection.query(sql, function(err, result) {
                    done();

                    var replace = '<tr><td></td><td></td><td></td><td></td><td></td></tr>';
                    var rows = '';

                    if (result && result.rowCount > 0) {
                        for(var i = 0; i < result.rowCount; i++) {
                            rows += '<tr>';

                            rows += '<td>' + result.rows[i].id + '</td>';
                            rows += '<td>' + result.rows[i].request_time + '</td>';
                            rows += '<td>' + result.rows[i].method + '</td>';
                            rows += '<td>' + result.rows[i].url + '</td>';
                            rows += '<td>' + result.rows[i].data + '</td>';

                            rows += '</tr>';
                        }
                    }
                    
                    page = apiPage;
                    page = common.replaceAll(page, replace, rows);

                    res.send(page);
                });
            });
        } else {
            sql = "insert into espresso.api (method, url, data)";
            sql += " values ($1, $2, $3);";
            values = ['GET', req.url, req.body];
    
            pool.connect(function(err, connection, done) {
                connection.query(sql, values, function(err, result) {
                    done();
                
                    if (err) {
                        console.log(err);
                    }
                    res.send({});
                });
            });
        }
    });	

	app.post('/api*', urlencodedParser, function(req, res) {
        sql = "insert into espresso.api (method, url, data)";
        sql += " values ($1, $2, $3);";
        values = ['POST', req.url, req.body];

		pool.connect(function(err, connection, done) {
			connection.query(sql, values, function(err, result) {
				done();
			
				if (err) {
					console.log(err);
				}
                res.send({});
			});
		});
    });	
}