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
        var restButton = document.getElementById('restbutton');
        var mealButton = document.getElementById('mealbutton');

        var shiftbutton = document.getElementById("shiftbutton");

        employeename.innerHTML = employee.name;
        contact.innerHTML = 'Contact: ' + employee.contact;
        starttime.innerHTML = 'Start time: ' + formatTime(employee.starttime);
        finishtime.innerHTML = 'Finish time: ' + formatTime(employee.finishtime);

        var breaks10mins = '';
        var breaks30mins = '';

        for(var i = 0; i < employee.breaks.length; i++)
        {
            var bStartTime = employee.breaks[i].startTime;
            var bFinishTime = employee.breaks[i].finishTime;
            var bBreakType = employee.breaks[i].breakType;

            if (bStartTime) {
                if (bFinishTime) {
                    if (bBreakType == 10) {
                        breaks10mins += '(10)' + getBreakMinutes(bStartTime, bFinishTime) + ' ';
                    } else if (bBreakType == 30) {
                        breaks30mins += '(30)' + getBreakMinutes(bStartTime, bFinishTime) + ' ';
                    }
                } else {
                    if (bBreakType == 10) {
                        breaks10mins += '(10)' + formatTime(bStartTime) + ' ';
                    } else if (bBreakType == 30) {
                        breaks30mins += '(30)' + formatTime(bStartTime) + ' ';
                    }
                }
            }
        }

        breaks.innerHTML = 'Breaks: ' + breaks10mins + '<br/>' + breaks30mins;

        if (employee.starttime) {
            shiftbutton.setAttribute('onclick', 'employeeFinish(' + employeeId + ');');
            shiftbutton.innerHTML = 'Finish Shift';
        } else {
            shiftbutton.setAttribute('onclick', 'employeeStart(' + employeeId + ');');
            shiftbutton.innerHTML = 'Start Shift';
        }

        restButton.setAttribute('onclick', 'employeeStartBreak(' + employeeId + ', 10);');

        if (employee.name) {
            employeename.classList.remove("invisible");
            contact.classList.remove("invisible");
            starttime.classList.remove("invisible");
            finishtime.classList.remove("invisible");
            breaks.classList.remove("invisible");
            shiftbutton.classList.remove("invisible");
            restButton.classList.remove("invisible");
            mealButton.classList.remove("invisible");
        } else {
            employeename.classList.add("invisible");
            contact.classList.add("invisible");
            starttime.classList.add("invisible");
            finishtime.classList.add("invisible");
            breaks.classList.add("invisible");
            shiftbutton.classList.add("invisible");
            restButton.classList.add("invisible");
            mealButton.classList.add("invisible");
        }

    });
}

function employeeStart(employeeId) {
    var employeePin = 1234;  //use alert!!  maybe...
    var startTime = getDbFormat() + ' ' + getTime();

    var json = { "employeeId": employeeId, "employeePin": employeePin, "startTime": startTime };

    sendPost("/employeestart", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinish(employeeId) {
    var employeePin = 1234;  //use alert!!  maybe...
    var date = getDbFormat();
    var finishTime = getDbFormat() + ' ' + getTime();

    var json = { "employeeId": employeeId, "employeePin": employeePin, "date": date, "finishTime": finishTime };

    sendPost("/employeefinish", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeStartBreak(employeeId, breakType) {
    var startTime = getDbFormat() + ' ' + getTime();

    var json = { "employeeId": employeeId, "startTime": startTime, "breakType": breakType };

    sendPost("/employeebreakstart", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinishBreak(employeeId, breakType) {
    var date = getDbFormat();
    var finishTime = getDbFormat() + ' ' + getTime();

    var json = { "employeeId": employeeId, "finishTime": finishTime, "breakType": breakType };

    sendPost("/employeebreakfinish", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}