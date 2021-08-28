var startFinishAndBreaks = {};

function getEmployees() {
    var employeecombo = document.getElementById('employeecombox');

    sendPost("/admin_getemployees", '{ "showEx": false }', function(response) {
        var employees = JSON.parse(response);

        for(var i = 0; i < employees.length; i++) {
            var option = document.createElement("option");
            option.setAttribute('value', employees[i].id);
            option.innerHTML = employees[i].name;
            employeecombo.appendChild(option);
        }
    });
}

function setDatesCombo() {
    var dayCombo = document.getElementById('day');

    var d = new Date();
    var day = d.getDay();

    optionDate = new Date(d);
    if (day == 0) {
        optionDate.setDate( optionDate.getDate() - 6 );
    } else {
        optionDate.setDate( optionDate.getDate() - (day - 1) - 7 ); // remove 7
    }

    for(var i = 1; i < 15; i++) {
        var value = getDbFormat(optionDate);
        var display = displayDate(optionDate) + ' (' + dayNames[optionDate.getDay()] + ')';
        var option = document.createElement("option");
        option.setAttribute('value', value);
        option.innerHTML = display;
        dayCombo.appendChild(option);
        optionDate.setDate(optionDate.getDate() + 1);
    }

    dayCombo.selectedIndex = 0;
}

function getStartFinishBreaks() {
    var employeecombo = document.getElementById('employeecombox');

    if (employeecombo.value.length == 0) {
        return;
    }

    var timesArea = document.getElementById('times');
    timesArea.innerHTML = '<h3>Loading...</h3>';
    var breaksArea = document.getElementById('breaks');
    breaksArea.innerHTML = '';

    var dayCombo = document.getElementById('day');

    var json = { "employeeId": employeecombo.value, "date": dayCombo.value };

    sendPost("/getemployeedetails", JSON.stringify(json), function(response) {
        timesArea.innerHTML = '';

        startFinishAndBreaks = JSON.parse(response);

        if (startFinishAndBreaks.starttime == "") {
            return;
        }

        for(var i = 0; i < startFinishAndBreaks.starttimes.length; i++) {
            var starttime = getTime(startFinishAndBreaks.starttimes[i].time);
            var finishtime = getTime(startFinishAndBreaks.finishtimes[i].time);

            var inputGroup = document.createElement("div");
            inputGroup.classList.add('input-group');
            inputGroup.classList.add('times');

            var span1 = document.createElement("span");
            span1.classList.add('input-group-addon');
            span1.innerHTML = 'Start Time';
            inputGroup.appendChild(span1);

            var input1 = document.createElement("input");
            input1.classList.add('form-control');
            input1.classList.add('starttime');
            input1.type = 'time';
            input1.value = starttime;
            input1.setAttribute('rowid', startFinishAndBreaks.starttimes[i].id);
            input1.setAttribute('employeeid', startFinishAndBreaks.id);
            inputGroup.appendChild(input1); 

            var span2 = document.createElement("span");
            span2.classList.add('input-group-addon');
            span2.innerHTML = 'Finish Time';
            inputGroup.appendChild(span2);

            var input2 = document.createElement("input");
            input2.classList.add('form-control');
            input2.classList.add('finishtime');
            input2.type = 'time';
            input2.value = finishtime;
            input2.setAttribute('rowid', startFinishAndBreaks.finishtimes[i].id);
            input2.setAttribute('employeeid', startFinishAndBreaks.id);
            inputGroup.appendChild(input2); 

            timesArea.appendChild(inputGroup);
            timesArea.appendChild(document.createElement('br'));
        }

        for(var i = 0; i < startFinishAndBreaks.breaks.length; i++) {
            var inputGroup2 = document.createElement("div");
            inputGroup2.classList.add('input-group');

            var span3 = document.createElement("span");
            span3.classList.add('input-group-addon');
            span3.innerHTML = 'Break ' + (i+1);
            inputGroup2.appendChild(span3);

            var input3 = document.createElement("input");
            input3.classList.add('form-control');
            input3.classList.add('breakminutes');
            input3.type = 'number';
            var breakmins = calculateMinutes(startFinishAndBreaks.breaks[i].startTime, startFinishAndBreaks.breaks[i].finishTime);
            input3.value = breakmins;
            input3.setAttribute('rowid', startFinishAndBreaks.breaks[i].id);
            input3.setAttribute('employeeid', startFinishAndBreaks.id);
            input3.setAttribute('starttime', startFinishAndBreaks.breaks[i].startTime);
            inputGroup2.appendChild(input3); 

            var span4 = document.createElement("span");
            span4.classList.add('input-group-addon');
            span4.setAttribute('id', 'type1-addon')
            span4.innerHTML = 'Type ' + (i+1);
            inputGroup2.appendChild(span4);
            
            var select = document.createElement("select");
            select.classList.add('input-small');
            select.classList.add('form-control');
            input3.classList.add('breaktype');
            select.setAttribute('aria-describedby', 'type1-addon');
            select.setAttribute('rowid', startFinishAndBreaks.breaks[i].id);
            select.setAttribute('employeeid', startFinishAndBreaks.id);

            var option1 = document.createElement("option");
            option1.value = "10";
            option1.innerHTML = '10m Rest Break'

            var option2 = document.createElement("option");
            option2.value = "30";
            option2.innerHTML = '30m Meal Break'

            select.appendChild(option1);
            select.appendChild(option2);
            inputGroup2.appendChild(select);

            select.value = startFinishAndBreaks.breaks[i].breakType;

            breaksArea.appendChild(inputGroup2);
        }
    });
}

function updateTimes() {
    var starttimes = document.getElementsByClassName('starttime');
    var finishtimes = document.getElementsByClassName('finishtime');
    var date = document.getElementById('day').value;
    
    if (!starttimes || starttimes.length == 0)
    {
        return;
    }
    if (!finishtimes || finishtimes.length == 0)
    {
        return;
    }

    var starttime = starttimes[0];
    var finishtime = finishtimes[finishtimes.length -1];

    var new_starttime = date + ' ' + starttime.value + ':00';
    var starttime_rowid = starttime.getAttribute('rowid');
    var starttime_employeeid = starttime.getAttribute('employeeid');

    var new_finishtime = date + ' ' + finishtime.value + ':00';
    var finishtime_rowid = finishtime.getAttribute('rowid');
    var finishtime_employeeid = finishtime.getAttribute('employeeid');

    if (starttime_employeeid != finishtime_employeeid)
    {
        alert('unexpected employeeid.  try refreshing the page');
        return;
    }

    var json = { employeeid: starttime_employeeid, starttime_rowid: starttime_rowid, new_starttime: new_starttime, finishtime_rowid: finishtime_rowid, new_finishtime: new_finishtime };

    sendPost("/updatetimes", JSON.stringify(json), function(response) {
        alert('start and finish time has been updated');
    });
}

function updateBreaks() {
    var breakminutes = document.getElementsByClassName('breakminutes');
    var breaktypes = document.getElementsByClassName('breaktype');

    if (breakminutes) {
        for(var i = 0; i < breakminutes.length; i++) {
            var minutes = breakminutes[i].value;
            var type = breaktypes[i].value;
            
            console.log('now i need to work the end time');
        }
    }
}

