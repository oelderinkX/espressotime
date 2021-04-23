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

function setDates() {
    var dayCombo = document.getElementById('day');

    var d = new Date();
    var day = d.getDay();

    optionDate = new Date(d);
    if (day == 0) {
        optionDate.setDate( optionDate.getDate() - 6 );
    } else {
        optionDate.setDate( optionDate.getDate() - (day - 1) );
    }

    for(var i = 1; i < 8; i++) {
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
    timesArea.innerHTML = 'Loading...';

    var dayCombo = document.getElementById('day');

    sendPost("/getemployeedetails", '{ "employeeId": "' + employeecombo.value +  '", "date": "'  + dayCombo.value + '" }', function(response) {
        var times = JSON.parse(response);

        var starttime = getTime(times.starttime);
        var finishtime = getTime(times.finishtime);

        var inputGroup = document.createElement("div");
        inputGroup.classList.add('input-group');

        var span1 = document.createElement("span");
        span1.classList.add('input-group-addon');
        span1.innerHTML = 'Start Time';
        inputGroup.appendChild(span1);

        var input1 = document.createElement("input");
        input1.classList.add('form-control');
        input1.type = 'text';
        input1.value = starttime;
        inputGroup.appendChild(input1); 

        var span2 = document.createElement("span");
        span2.classList.add('input-group-addon');
        span2.innerHTML = 'Finish Time';
        inputGroup.appendChild(span2);

        var input2 = document.createElement("input");
        input2.classList.add('form-control');
        input2.type = 'text';
        input2.value = finishtime;
        inputGroup.appendChild(input2); 

        timesArea.appendChild(inputGroup);
    });
}