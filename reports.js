var pg = require('pg');
var common = require('./script/common.js');

var pool = new pg.Pool(common.postgresConfig());

function AssetReport(res, shopId) {
	var response = '<html><body>';

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

					response += 'name,cost,status,employee,notes<br/>';

					if (result && result.rowCount > 0) {
						for(var i = 0; i < result.rowCount; i++) {
							//name, cost, status, employeeid, notes

							response += '"' + result.rows[i].name + '",';
							response += result.rows[i].cost + ',';
							response += '"' + result.rows[i].status + '",';
							response += '"' + getEmployeeNameById(employees, result.rows[i].employeeid) + '",';
							response += '"' + result.rows[i].notes + '"<br/>';
						}
					}

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