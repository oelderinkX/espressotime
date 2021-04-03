var backToMainTimer;

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

    document.getElementById('time').innerHTML = h + ":" + m + ' ' + ampm + ' &nbsp;&nbsp;&nbsp;&nbsp;';

    t = setTimeout(function() {
      clock()
    }, 10000);
  }
  
function parseTelephone(ph) {
    if (ph) {
        ph = ph.replace('(', '');    
        ph = ph.replace(')', '');
        ph = ph.replace(/^0+/, '')
        while (ph.indexOf(' ') > -1) {
            ph = ph.replace(' ', '');
        }
    }
    return ph;
}

function getEmployees() {
    sendPost("/getemployees", '', function(response) {
        var employees = JSON.parse(response);

        var mobilenavbar = document.getElementById("mobilenavbar");
        var webnavbar = document.getElementById("webnavbar");

        var mobileemployeelist = document.getElementById("mobileemployeelist");
        var webemployeelist = document.getElementById("webemployeelist");

        for(var i = 0; i < employees.length; i++) {
            if (webnavbar.offsetHeight == 0) {
                var li1 = document.createElement("li");
                var a1 = document.createElement("a");
                a1.setAttribute('href', '#');
                a1.innerHTML = employees[i].name;
                a1.setAttribute('onclick', 'getEmployeeDetails(' + employees[i].id + ');');
                li1.appendChild(a1);
                li1.classList.add('active');
                mobileemployeelist.appendChild(li1);
            }

            if (webnavbar.offsetHeight > 0) {
                var li2 = document.createElement("li");
                var a2 = document.createElement("a");
                a2.setAttribute('href', '#');
                a2.innerHTML = employees[i].name;
                a2.setAttribute('onclick', 'getEmployeeDetails(' + employees[i].id + ');');
                li2.appendChild(a2);
                li2.classList.add('active');
                webemployeelist.appendChild(li2);
            }
        }
    });
}

function getEmployeeDetails(employeeId) {
    var date = getDbFormat();

    sendPost("/getemployeedetails", '{ "employeeId": "' + employeeId +  '", "date": "'  + date + '" }', function(response) {
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
        
        if (employee.contact && employee.contact.length > 0) {
            contact.innerHTML = 'Contact: <a class="ah3" href="tel:' + parseTelephone(employee.contact) + '">' + employee.contact + '</a>' ;
        } else {
            contact.innerHTML = '';
        }

        starttime.innerHTML = 'Start time: ' + formatTime(employee.starttime);
        finishtime.innerHTML = 'Finish time: ' + formatTime(employee.finishtime);

        var breaks10mins = '';
        var breaks30mins = '';

        var on10minBreak = false;
        var on30minBreak = false;


        if (employee.breaks) {
            for(var i = 0; i < employee.breaks.length; i++) {
                var bStartTime = employee.breaks[i].startTime;
                var bFinishTime = employee.breaks[i].finishTime;
                var bBreakType = employee.breaks[i].breakType;

                if (bStartTime) {
                    if (bFinishTime) {
                        if (bBreakType == 10) {
                            breaks10mins += '&nbsp;&nbsp;&nbsp;(Rest Break) ' + calculateMinutes(bStartTime, bFinishTime) + 'mins <br/>';
                        } else if (bBreakType == 30) {
                            breaks30mins += '&nbsp;&nbsp;&nbsp;(Meal Break) ' + calculateMinutes(bStartTime, bFinishTime) + 'mins <br/>';
                        }
                    } else {
                        if (bBreakType == 10) {
                            breaks10mins += '&nbsp;&nbsp;&nbsp;(Rest Break) ' + formatTime(bStartTime) + ' - <br/>';
                            on10minBreak = true;
                        } else if (bBreakType == 30) {
                            breaks30mins += '&nbsp;&nbsp;&nbsp;(Meal Break) ' + formatTime(bStartTime) + ' - <br/>';
                            on30minBreak = true;
                        }
                    }
                }
            }
        }

        breaks.innerHTML = 'Breaks: <br/>' + breaks10mins + '<br/>' + breaks30mins;

        var shiftButtonAttribute = '';
        if (employee.starttime && !employee.finishtime) {
            shiftButtonAttribute = 'employeeFinish(' + employeeId + ');';
            shiftbutton.innerHTML = 'Finish Shift';
        } else {
            shiftButtonAttribute = 'employeeStart(' + employeeId + ');';
            shiftbutton.innerHTML = 'Start Shift';
        }

        var restButtonAttribute = '';
        var mealButtonAttribute = '';
        if (on10minBreak) {
            restButtonAttribute = 'employeeFinishBreak(' + employeeId + ', 10);';
            restButton.innerHTML = 'Finish 10min Break';
        } else {
            restButtonAttribute = 'employeeStartBreak(' + employeeId + ', 10);';
            restButton.innerHTML = 'Start 10min Break';
        }

        if (on30minBreak) {
            mealButtonAttribute = 'employeeFinishBreak(' + employeeId + ', 30);';
            mealButton.innerHTML = 'Finish 30min Break';;
        } else {
            mealButtonAttribute = 'employeeStartBreak(' + employeeId + ', 30);';
            mealButton.innerHTML = 'Start 30min Break';;
        }

        if (employee.starttime && !employee.finishtime) {
            restButton.classList.remove("disabled");
            restButton.setAttribute('onclick', restButtonAttribute);
            mealButton.classList.remove("disabled");
            mealButton.setAttribute('onclick', mealButtonAttribute);
        } else {
            restButton.classList.add("disabled");
            restButton.removeAttribute('onclick');
            mealButton.classList.add("disabled");
            mealButton.removeAttribute('onclick');
        }

        if (on10minBreak) {
            shiftbutton.classList.add("disabled");
            shiftbutton.removeAttribute('onclick');
            mealButton.classList.add("disabled");
            mealButton.removeAttribute('onclick');
        }

        if (on30minBreak) {
            shiftbutton.classList.add("disabled");
            shiftbutton.removeAttribute('onclick');
            restButton.classList.add("disabled");
            restButton.removeAttribute('onclick');
        }

        if (!on10minBreak && !on30minBreak) {
            shiftbutton.classList.remove("disabled");
            shiftbutton.setAttribute('onclick', shiftButtonAttribute);
        }

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

        var mobilenavbar = document.getElementById("mobilenavbar");
        if (mobilenavbar.offsetHeight > 0) {
            breaks.classList.add("invisible");
            shiftbutton.classList.add("invisible");
            restButton.classList.add("invisible");
            mealButton.classList.add("invisible");
        }

        if (employeeId != 0) {
            window.clearTimeout(backToMainTimer);
            backToMainTimer = window.setTimeout(function() {
                window.location.href = "/";
              }, 60000);
        }
    });
}

function employeeStart(employeeId) {
    var employeePin = 1234; 
    var startTime = getDbFormat() + ' ' + getTime();
    var json = { "employeeId": employeeId, "employeePin": employeePin, "startTime": startTime };

    var shiftbutton = document.getElementById("shiftbutton");
    shiftbutton.removeAttribute('onclick');

    sendPost("/employeestart", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinish(employeeId) {
    var employeePin = 1234;  //use alert!!  maybe...
    var date = getDbFormat();
    var finishTime = getDbFormat() + ' ' + getTime();
    var json = { "employeeId": employeeId, "employeePin": employeePin, "date": date, "finishTime": finishTime };

    var shiftbutton = document.getElementById("shiftbutton");
    shiftbutton.removeAttribute('onclick');

    sendPost("/employeefinish", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeStartBreak(employeeId, breakType) {
    var startTime = getDbFormat() + ' ' + getTime();
    var json = { "employeeId": employeeId, "startTime": startTime, "breakType": breakType };

    var restButton = document.getElementById('restbutton');
    var mealButton = document.getElementById('mealbutton');
    restButton.removeAttribute('onclick');
    mealButton.removeAttribute('onclick');

    sendPost("/employeebreakstart", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinishBreak(employeeId, breakType) {
    var date = getDbFormat();
    var finishTime = getDbFormat() + ' ' + getTime();
    var json = { "employeeId": employeeId, "finishTime": finishTime, "breakType": breakType };

    var restButton = document.getElementById('restbutton');
    var mealButton = document.getElementById('mealbutton');
    restButton.removeAttribute('onclick');
    mealButton.removeAttribute('onclick');

    sendPost("/employeebreakfinish", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}