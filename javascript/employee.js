var shopId = -1234567890121212;
var pass = "!!%PASS%!!";

function getEmployees() {
    sendPost("/getemployees", '', function(response) {
        var employees = JSON.parse(response);
        for(var i = 0; i < employees.length; i++)
        {
            console.log(employees[i].name);
        }
    });
}
