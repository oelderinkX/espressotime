var backToMainTimer;
var refreshMainTimer;
var slowConnectTimer;

var roles = [];

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

    if (isMobileDevice()) {
        document.getElementById('time').innerHTML = '';
    } else {
        document.getElementById('time').innerHTML = h + ":" + m + ' ' + ampm + ' &nbsp;&nbsp;&nbsp;&nbsp;';
        t = setTimeout(function() {
            clock()
          }, 10000);
    }
  }
  
function parseTelephone(ph) {
    if (ph) {
        ph = ph.replace('(', '');    
        ph = ph.replace(')', '');
        while (ph.indexOf(' ') > -1) {
            ph = ph.replace(' ', '');
        }
    }
    return ph;
}

function isMobileDevice() {
    var webnavbar = document.getElementById("webnavbar");

    if (webnavbar.offsetHeight == 0) {
        return true;
    } else {
        return false;
    }
}

function getEmployees() {
    //sendPost("/getemployees", '', function(response) {
    var request = {};
    sendPost("/getroles", JSON.stringify(request), function(response) {
        roles =  JSON.parse(response);
        var request = { date: getDbFormat() }
        sendPost("/getemployees_new",  JSON.stringify(request), function(response) {
            var employees = JSON.parse(response);

            employees = employees.sort((a, b) => {
                var n1 = a.roster_start ? new Date(a.roster_start) : new Date(8640000000000000);
                var n2 = b.roster_start ? new Date(b.roster_start) : new Date(8640000000000000);
                if (n1 > n2) {
                    return 1;
                } else if (n1 < n2) {
                    return - 1;
                } else {
                    return 0;
                }
              });

            var mobileemployeelist = document.getElementById("mobileemployeelist");
            var webemployeelist = document.getElementById("webemployeelist");
            var webemployeelist2 = document.getElementById("webemployeelist2");

            for(var i = 0; i < employees.length; i++) {
                if (isMobileDevice()) {
                    var li1 = document.createElement("li");
                    var a1 = document.createElement("a");
                    a1.setAttribute('href', '#');
                    a1.innerHTML = employees[i].name;
                    a1.setAttribute('onclick', 'document.getElementById("hamburger").click(); getEmployeeDetails(' + employees[i].id + ');');
                    li1.appendChild(a1);
                    li1.classList.add('active');
                    mobileemployeelist.appendChild(li1);
                } else {
                    var li2 = document.createElement("li");
                    var a2 = document.createElement("a");
                    a2.setAttribute('href', '#');
                    a2.innerHTML = employees[i].name;
                    a2.setAttribute('onclick', 'getEmployeeDetails(' + employees[i].id + ');');
                    li2.appendChild(a2);
                    li2.classList.add('active');

                    if (employees[i].roster_start == '' || (new Date(employees[i].roster_finish) - new Date(employees[i].roster_start)) == 0) {
                        a2.style.background = '#1f1f1f';
                        a2.style.color = '#f3f4e6';

                        if (employees[i].starttime !== '') {
                            var span = document.createElement("span");
                            span.classList.add('glyphicon glyphicon-ok');
                            a2.appendChild(span);
                        }

                        webemployeelist2.appendChild(li2);
                    } else {
                        var roleBg = getRoleColour(employees[i].role);
                        var roleTxt = getRoleTextColour(employees[i].role);
                        a2.style.background = roleBg;
                        a2.style.color = roleTxt;
    
                        if (employees[i].starttime !== '') {
                            var span = document.createElement("span");
                            span.classList.add('glyphicon glyphicon-ok');
                            a2.appendChild(span);
                        }

                        webemployeelist.appendChild(li2);
                    }                    
                }
            }
        });
    });
}

function getEmployeeDetails(employeeId) {
    var date = getDbFormat();

    var employeename = document.getElementById("employeename");
    var starttime = document.getElementById("starttime");
    var finishtime = document.getElementById("finishtime");
    var breaks = document.getElementById("breaks");
    var restButton = document.getElementById('restbutton');
    var mealButton = document.getElementById('mealbutton');
    var shiftbutton = document.getElementById("shiftbutton");
    var shiftnotes = document.getElementById("shiftnotes");
    var shiftnotesbutton = document.getElementById("shiftnotesbutton");
    var shiftnotesarea = document.getElementById("shiftnotesarea");
    var allemployeestatus = document.getElementById("allemployeestatus");

    starttime.classList.add("invisible");
    finishtime.classList.add("invisible");
    breaks.classList.add("invisible");
    shiftbutton.classList.add("invisible");
    restButton.classList.add("invisible");
    mealButton.classList.add("invisible");
    shiftnotes.classList.add("invisible");
    shiftnotesbutton.classList.add("invisible");
    shiftnotesarea.classList.add("invisible");

    allemployeestatus.innerHTML = '';

    employeename.innerHTML = '';
    clearTimeout(slowConnectTimer);
    slowConnectTimer = setTimeout(function() {
        employeename.innerHTML = 'Loading, please wait...';
    }, 700);

    sendPost("/getemployeedetails", '{ "employeeId": "' + employeeId +  '", "date": "'  + date + '" }', function(response) {
        clearTimeout(slowConnectTimer);

        var employee = JSON.parse(response);

        employeename.innerHTML = employee.name;
        
        starttime.innerHTML = 'Start time: ' + formatTime(employee.starttime);
        finishtime.innerHTML = 'Finish time: ' + formatTime(employee.finishtime);

        var breaks10mins = '';
        var breaks30mins = '';

        var on10minBreak = false;
        var on30minBreak = false;
        var startedShift = false;

        if (employee.breaks) {
            for(var i = 0; i < employee.breaks.length; i++) {
                var bStartTime = employee.breaks[i].startTime;
                var bFinishTime = employee.breaks[i].finishTime;
                var bBreakType = employee.breaks[i].breakType;

                if (bStartTime) {
                    if (bFinishTime) {
                        if (bBreakType == 10) {
                            breaks10mins += '&nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span> ' + formatTime(bStartTime) + '-' + formatTime(bFinishTime) + ' (' + calculateMinutes(bStartTime, bFinishTime) + ' mins) <br/>';
                        } else if (bBreakType == 30) {
                            breaks30mins += '&nbsp;&nbsp;<span class="glyphicon glyphicon-cutlery"></span> ' + formatTime(bStartTime) + '-' + formatTime(bFinishTime) + ' (' + calculateMinutes(bStartTime, bFinishTime) + ' mins) <br/>';
                        }
                    } else {
                        if (bBreakType == 10) {
                            breaks10mins += '&nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span> ' + formatTime(bStartTime) + '- <br/>';
                            on10minBreak = true;
                        } else if (bBreakType == 30) {
                            breaks30mins += '&nbsp;&nbsp;<span class="glyphicon glyphicon-cutlery"></span> ' + formatTime(bStartTime) + '- <br/>';
                            on30minBreak = true;
                        }
                    }
                }
            }
        }

        breaks.innerHTML = 'Breaks: <br/>' + breaks10mins + '<br/>' + breaks30mins;

        var shiftButtonAttribute = '';
        var shiftButtonStyle = 'btn-success';
        if (employee.starttime && !employee.finishtime) {
            startedShift = true;
            shiftButtonStyle = 'btn-danger';
            shiftButtonAttribute = 'employeeFinish(' + employeeId + ');';
            shiftbutton.innerHTML = '<span class="glyphicon glyphicon-user"></span> Finish Shift';
        } else {
            shiftButtonAttribute = 'employeeStart(' + employeeId + ');';
            shiftbutton.innerHTML = '<span class="glyphicon glyphicon-user"></span> Start Shift';
        }

        var restButtonAttribute = '';
        var restButtonStyle = '';
        var mealButtonAttribute = '';
        var mealButtonStyle = '';
        if (on10minBreak) {
            restButtonStyle = 'btn-danger';
            restButtonAttribute = 'employeeFinishBreak(' + employeeId + ', 10);';
            restButton.innerHTML = '<span class="glyphicon glyphicon-time"></span> 10min Break';
        } else {
            restButtonStyle = 'btn-success';
            restButtonAttribute = 'employeeStartBreak(' + employeeId + ', 10);';
            restButton.innerHTML = '<span class="glyphicon glyphicon-time"></span> 10min Break';
        }

        if (on30minBreak) {
            mealButtonStyle = 'btn-danger';
            mealButtonAttribute = 'employeeFinishBreak(' + employeeId + ', 30);';
            mealButton.innerHTML = '<span class="glyphicon glyphicon-cutlery"></span> 30min Break';;
        } else {
            mealButtonStyle = 'btn-success';
            mealButtonAttribute = 'employeeStartBreak(' + employeeId + ', 30);';
            mealButton.innerHTML = '<span class="glyphicon glyphicon-cutlery"></span> 30min Break';;
        }

        if (employee.starttime && !employee.finishtime) {
            restButton.className = 'btn btn-lg ' + restButtonStyle;
            restButton.setAttribute('onclick', restButtonAttribute);
            mealButton.className = 'btn btn-lg ' + mealButtonStyle;
            mealButton.setAttribute('onclick', mealButtonAttribute);
        } else {
            restButton.removeAttribute('onclick');
            restButton.className = 'btn btn-lg btn-secondary disabled';
            mealButton.removeAttribute('onclick');
            mealButton.className = 'btn btn-lg btn-secondary disabled';
        }

        if (on10minBreak) {
            shiftbutton.className = 'btn btn-lg btn-secondary disabled';
            shiftbutton.removeAttribute('onclick');
            mealButton.className = 'btn btn-lg btn-secondary disabled';
            mealButton.removeAttribute('onclick');
        }

        if (on30minBreak) {
            shiftbutton.className = 'btn btn-lg btn-secondary disabled';
            shiftbutton.removeAttribute('onclick');
            restButton.className = 'btn btn-lg btn-secondary disabled';
            restButton.removeAttribute('onclick');
        }

        if (!on10minBreak && !on30minBreak) {
            shiftbutton.className = 'btn btn-lg ' + shiftButtonStyle;
            shiftbutton.setAttribute('onclick', shiftButtonAttribute);
        }

        shiftnotes.value = employee.notes;
        shiftnotesbutton.setAttribute('onclick', "saveNotes(" + employeeId + ");");

        if (employee.name) {
            employeename.classList.remove("invisible");
            starttime.classList.remove("invisible");
            finishtime.classList.remove("invisible");
            breaks.classList.remove("invisible");
            shiftbutton.classList.remove("invisible");
            restButton.classList.remove("invisible");
            mealButton.classList.remove("invisible");
            shiftnotes.classList.remove("invisible");
            shiftnotesbutton.classList.remove("invisible");
            shiftnotesarea.classList.remove("invisible");
        } else {
            employeename.classList.add("invisible");
            shiftbutton.classList.add("invisible");
            restButton.classList.add("invisible");
            mealButton.classList.add("invisible");
            shiftnotes.classList.add("invisible");
            shiftnotesbutton.classList.add("invisible");
            shiftnotesarea.classList.add("invisible");
        }

        var mobilenavbar = document.getElementById("mobilenavbar");
        if (isMobileDevice()) {
            shiftbutton.classList.add("invisible");
            restButton.classList.add("invisible");
            mealButton.classList.add("invisible");
        }

        if (employeeId != 0) {
            window.clearTimeout(backToMainTimer);
            backToMainTimer = window.setTimeout(function() {
                window.location.href = "/device";
              }, 120000);
        } else {
            sendPost("/allemployeestatus", '{ "starttime": "' + date + ' 00:00:00' + '" }', function(response) {
                var working = JSON.parse(response);
                var update = '<h1>On the floor</h1><ul>';
                for(var i = 0; i < working.length; i++) {
                    if (working[i].status == 'W') {
                        update += '<li>' + working[i].name + '</li>';
                    }
                }
                update += '</ul><br/>';
                update += '<br/>';

                update += '<h1>On a Break</h1><ul>';
                for(var i = 0; i < working.length; i++) {
                    if (working[i].status == '10' || working[i].status == '30') {
                        update += '<li>' + working[i].name + '</li>';
                    }
                }
                update += '</ul><br/>';
                update += '<br/>';

                update += '<h1>Finished Shift</h1><ul>';
                for(var i = 0; i < working.length; i++) {
                    if (working[i].status == 'F') {
                        update += '<li>' + working[i].name + '</li>';
                    }
                }
                update += '</ul><br/>';
                update += '<br/>';

                allemployeestatus.innerHTML = update;
            });
            window.clearTimeout(refreshMainTimer);
            refreshMainTimer = window.setTimeout(function() {

                var randomPage = Math.floor(Math.random() * 5) + 1;
                var refresh = Math.floor(Math.random() * 9007199254740990) + 1;

                if (randomPage == 1) {
                    window.location.href = "/device?refresh=" + refresh;
                } else if (randomPage == 2) {
                    window.location.href = "/how?refresh=" + refresh;
                } else if (randomPage == 3) {
                    window.location.href = "/foh_roster?refresh=" + refresh;
                } else if (randomPage == 4) {
                    window.location.href = "/tasks?refresh=" + refresh;
                } else if (randomPage == 5) {
                    window.location.href = "/tasksrecurring?refresh=" + refresh;
                }
              }, 240000);
        }
    });
}

function saveNotes(employeeId) {
    var date = getDbFormat();
    var notes = document.getElementById("shiftnotes").value;

    var json = { "employeeId": employeeId, "date": date, "notes": notes };

    sendPost("/savenotes", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeStart(employeeId) {
    var startTime = getDbFormat() + ' ' + getTime();
    var json = { "employeeId": employeeId, "startTime": startTime };

    var shiftbutton = document.getElementById("shiftbutton");
    shiftbutton.removeAttribute('onclick');

    sendPost("/employeestart", JSON.stringify(json), function(response) {
        getEmployeeDetails(employeeId);
    });
}

function employeeFinish(employeeId) {
    var date = getDbFormat();

    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var d = now.getDay();

    //after 6pm, between 0 and 15mins and not thursday
    if (h == 18 && m >= 0 & m <= 15 & d != 4 ) {
        now.setMinutes(15);
    }
    var finishTime = getDbFormat() + ' ' + getTime(now);

    var json = { "employeeId": employeeId, "date": date, "finishTime": finishTime };

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

    if (option_allowSingleClickBreaks()) {
        var futureTime = new Date();
        futureTime.setMinutes(futureTime.getMinutes()+breakType);
        var finishTime =  getDbFormat() + ' ' + getTime(futureTime);
        json = { "employeeId": employeeId, "startTime": startTime, "finishTime": finishTime, "breakType": breakType };
        sendPost("/employeehavebreak", JSON.stringify(json), function(response) {
            getEmployeeDetails(employeeId);
        });
    } else {
        sendPost("/employeebreakstart", JSON.stringify(json), function(response) {
            getEmployeeDetails(employeeId);
        });
    }
}

function employeeFinishBreak(employeeId, breakType) {
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

function setTasksButton() {
    if (isMobileDevice()) {
        var tasksbutton = document.getElementById('tasksbutton');
        tasksbutton.setAttribute('onclick', "window.location.href='/tasksmobile';");
    }
}

function getRoleColour(role) {
    for(var i = 0; i < roles.length; i++) {
      if (roles[i].name.toLowerCase() == role.toLowerCase()) {
        return roles[i].colour;
      }
    }
  }
  
  function getRoleTextColour(role) {
    for(var i = 0; i < roles.length; i++) {
      if (roles[i].name.toLowerCase() == role.toLowerCase()) {
        return roles[i].textcolour;
      }
    }
  }