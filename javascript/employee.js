function pad(i)
{
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function clock() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var ampm = "am";
    m = pad(m);

    if (h > 11) {
        ampm = "pm";
    }

    if (h > 12) {
        h = h - 12;
    }

    document.getElementById('time').innerHTML = h + ":" + m + ' ' + ampm;

    t = setTimeout(function() {
      clock()
    }, 10000);
  }
  
function getEmployees() {
    sendPost("/getemployees", '', function(response) {
        var employees = JSON.parse(response);

        var employeelist1 = document.getElementById("employeelist1");
        var employeelist2 = document.getElementById("employeelist2");

        for(var i = 0; i < employees.length; i++) {
            var li1 = document.createElement("li");
            var a1 = document.createElement("a");
            a1.setAttribute('href', '#');
            a1.innerHTML = employees[i].name;
            li1.appendChild(a1);
            li1.classList.add('active');
            employeelist1.appendChild(li1);

            var li2 = document.createElement("li");
            var a2 = document.createElement("a");
            a2.setAttribute('href', '#');
            a2.innerHTML = employees[i].name;
            li2.appendChild(a2);
            li2.classList.add('active');
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
        starttime.innerHTML = 'Start time: ' + employee.starttime;
        finishtime.innerHTML = 'Finish time: ' + employee.finishtime;
        breaks.innerHTML = 'Breaks: ' + employee.breaks;
    });
}
