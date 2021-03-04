function getEmployees() {
    sendPost("/getemployees", '', function(response) {
        var employees = JSON.parse(response);

        var employeelist1 = document.getElementById("employeelist1");
        var employeelist2 = document.getElementById("employeelist2");

        for(var i = 0; i < employees.length; i++)
        {
            var li1 = document.createElement("li");
            var a1 = document.createElement("a");
            a1.setAttribute('href', '#');
            a1.innerHTML = employees[i].name;
            li1.appendChild(a1);
            employeelist1.appendChild(li1);

            var li2 = document.createElement("li");
            var a2 = document.createElement("a");
            a2.setAttribute('href', '#');
            a2.innerHTML = employees[i].name;
            li2.appendChild(a2);
            employeelist2.appendChild(li2);
        }
    });
}

function getEmployeeDetails(employeeId) {
    sendPost("/getemployeedetails", '{ "employeeId": "' + employeeId +  '" }', function(response) {
        var employee = JSON.parse(response);

        var employeename = document.getElementById("employeename");
        var starttime = document.getElementById("starttime");
        var finishtime = document.getElementById("finishtime");
        var breaks = document.getElementById("breaks");


        employeename.innerHTML = employee.name;
        starttime.innerHTML = employee.starttime;
        finishtime.innerHTML = employee.finishtime;
        breaks.innerHTML = employee.breaks;
    });
}
