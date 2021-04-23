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
        var display = displayDate(optionDate);
        var option = document.createElement("option");
        option.setAttribute('value', value);
        option.innerHTML = display;
        dayCombo.appendChild(option);
        optionDate.setDate(optionDate.getDate() + 1);
    }
}

function getStartFinishBreaks() {
    var employeecombo = document.getElementById('employeecombox');

    if (employeecombo.value.length == 0) {
        return;
    }

    var day = document.getElementById('day');
    var month = document.getElementById('month');
    var year = document.getElementById('year');

    var d = new Date(year.value, month.value - 1, day.value);
    var dbDate = getDbFormat(d);

    sendPost("/getemployeedetails", '{ "employeeId": "' + employeecombo.value +  '", "date": "'  + dbDate + '" }', function(response) {
        var times = JSON.parse(response);

        //check if empty and clear and recreate elements
        //maybe allow for multiple ?  not sure
        //lets just maybe update breaks on id's!!!!  
        

        var starttime = getTime(times.starttime);
        var finishtime = getTime(times.finishtime);

        var starttimeField = document.getElementById('starttime');
        var finishtimeField = document.getElementById('finishtime');

        starttimeField.value = starttime;
        finishtimeField.value = finishtime;

    });
}