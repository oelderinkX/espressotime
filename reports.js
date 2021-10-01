var pg = require('pg');
var fs = require("fs");
var common = require('./script/common.js');

var pool = new pg.Pool(common.postgresConfig());

var table = fs.readFileSync(__dirname + "/webpage/table.html", "utf8");

function AssetReport(res, shopId) {
	var response = table;

	var employeesql = "select id, name from espresso.employee where shopid = $1";
	var sql = "select name, cost, status, employeeid, notes from espresso.asset where shopid = $1";

	pool.connect(function(err, connection, done) {
		connection.query(employeesql, [shopId], function(err, result) {
			done();

			var employees = [];

			if (result && result.rowCount > 0) {
				for(var i = 0; i < result.rowCount; i++) {
					employees.push({	id: result.rows[i].id,
										name: result.rows[i].name
									});
				}
			}

			pool.connect(function(err, connection, done) {
				connection.query(sql, [shopId], function(err, result) {
					done();

					var headings = '<th scope="col">name</th>\n';
					headings += '<th scope="col">cost</th>\n';
					headings += '<th scope="col">status</th>\n';
					headings += '<th scope="col">employee</th>\n';
					headings += '<th scope="col">notes</th>\n';

					var rows = '';

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							rows += '<tr>\n';
							rows += '<td>' + result.rows[i].name + '</td>\n';
							rows += '<td>' + result.rows[i].cost + '</td>\n';
							rows += '<td>' +  result.rows[i].status + '</td>\n';
							rows += '<td>' + getEmployeeNameById(employees, result.rows[i].employeeid) + '</td>\n';
							rows += '<td>' + result.rows[i].notes + '</td>\n';
							rows += ' </tr>\n';
						}
					}

					response = common.replaceAll(response, '!%HEADINGS%!', headings);
					response = common.replaceAll(response, '!%ROWS%!', rows);

					res.send(response);
				});
			});
		});
	});

	
}
module.exports.AssetReport = AssetReport;

function getEmployeeNameById(employees, id)
{
	for(var i = 0; i < employees.length; i++) {
		if (employees[i].id == id) {
			return employees[i].name;
		}
	}
	return '';
}