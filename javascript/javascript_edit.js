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
    timesArea.innerHTML = '<h3>Loading...</h3>';
    var breaksArea = document.getElementById('breaks');
    breaksArea.innerHTML = '';

    var dayCombo = document.getElementById('day');

    sendPost("/getemployeedetails", '{ "employeeId": "' + employeecombo.value +  '", "date": "'  + dayCombo.value + '" }', function(response) {
        timesArea.innerHTML = '';

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

        // breaks
        var inputGroup2 = document.createElement("div");

        var span3 = document.createElement("span");
        span3.classList.add('input-group-addon');
        span3.innerHTML = 'Break NUM';
        inputGroup2.appendChild(span3);

        var input3 = document.createElement("input");
        input3.classList.add('form-control');
        input3.type = 'text';
        input3.value = '12:00';
        inputGroup2.appendChild(input3); 

        var span4 = document.createElement("span");
        span4.classList.add('input-group-addon');
        span4.setAttribute('id', 'type1-addon')
        span4.innerHTML = 'Type NUM';
        inputGroup2.appendChild(span4);
        
        var select = document.createElement("select");
        select.classList.add('input-small');
        select.classList.add('form-control');
        select.setAttribute('aria-describedby', 'type1-addon')

        var option1 = document.createElement("option");
        option1.value = "10";
        option1.innerHTML = '10m Rest Break'

        var option2 = document.createElement("option");
        option2.value = "30";
        option2.innerHTML = '30m Meal Break'

        select.appendChild(option1);
        select.appendChild(option2);
        inputGroup2.appendChild(select);

        breaksArea.appendChild(inputGroup2);
    });
}