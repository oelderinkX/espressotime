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
            a1.setAttribute('onclick', 'getEmployeeDetails(' + employees[i].id + ');');
            li1.appendChild(a1);
            li1.classList.add('active');
            employeelist1.appendChild(li1);

            var li2 = document.createElement("li");
            var a2 = document.createElement("a");
            a2.setAttribute('href', '#');
            a2.innerHTML = employees[i].name;
            a2.setAttribute('onclick', 'getEmployeeDetails(' + employees[i].id + ');');
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
        var contact = document.getElementById("contact");
        var starttime = document.getElementById("starttime");
        var finishtime = document.getElementById("finishtime");
        var breaks = document.getElementById("breaks");
        var break10Button = document.getElementById('break10button');
        var break30Button = document.getElementById('break30button');

        var startfinishbutton = document.getElementById("startfinishbutton");
        //var finishbutton = document.getElementById("finishbutton");

        employeename.innerHTML = employee.name;
        contact.innerHTML = 'Contact: ' + employee.contact;
        starttime.innerHTML = 'Start time: ' + getTime(employee.starttime);
        finishtime.innerHTML = 'Finish time: ' + getTime(employee.finishtime);
        breaks.innerHTML = 'Breaks: ' + employee.breaks;

        if (employee.starttime) {
            startfinishbutton.setAttribute('onclick', 'employeeFinish(' + employeeId + ');');
            startfinishbutton.innerHTML = 'Finish Shift';
        } else {
            startfinishbutton.setAttribute('onclick', 'employeeStart(' + employeeId + ');');
            startfinishbutton.innerHTML = 'Start Shift';
        }
        
        

        if (employee.name) {
            employeename.classList.remove("invisible");
            contact.classList.remove("invisible");
            starttime.classList.remove("invisible");
            finishtime.classList.remove("invisible");
            breaks.classList.remove("invisible");
            startbutton.classList.remove("invisible");
            finishbutton.classList.remove("invisible");
            break10Button.classList.remove("invisible");
            break30Button.classList.remove("invisible");
        } else {
            employeename.classList.add("invisible");
            contact.classList.add("invisible");
            starttime.classList.add("invisible");
            finishtime.classList.add("invisible");
            breaks.classList.add("invisible");
            startbutton.classList.add("invisible");
            finishbutton.classList.add("invisible");
            break10Button.classList.add("invisible");
            break30Button.classList.add("invisible");
        }

    });
}

function employeeStart(employeeId) {
    var employeePin = 1234;  //use alert!!  maybe...

    sendPost("/employeestart", '{ "employeeId": "' + employeeId +  '", "employeePin": "' + employeePin + '" }', function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinish(employeeId) {
    var employeePin = 1234;  //use alert!!  maybe...

    sendPost("/employeefinish", '{ "employeeId": "' + employeeId +  '", "employeePin": "' + employeePin + '" }', function(response) {
        getEmployeeDetails(employeeId);
    });
}