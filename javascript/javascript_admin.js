var scheduleStart = new Date();
var scheduleEnd = new Date();

function getEmployees() {
    sendPost("/admin_getemployees", '', function(response) {
        var employees = JSON.parse(response);

        var employeelist = document.getElementById('employeelist');

        for(var i = 0; i < employees.length; i++) {
            var tr = document.createElement("tr");

            var th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.innerHTML = employees[i].id;

            var td1 = document.createElement('td');
            var input1 = document.createElement('input');
            input1.setAttribute('type', 'text');
            input1.setAttribute('id', 'name' + employees[i].id);
            input1.setAttribute('value', employees[i].name);
            td1.appendChild(input1);

            var td2 = document.createElement('td');
            var input2 = document.createElement('input');
            input2.setAttribute('type', 'text');
            input2.setAttribute('id', 'contact' + employees[i].id);
            input2.setAttribute('value', employees[i].contact);
            td2.appendChild(input2);

            var td3 = document.createElement('td');
            var input3 = document.createElement('input');
            input3.setAttribute('type', 'text');
            input3.setAttribute('id', 'pin' + employees[i].id);
            input3.setAttribute('value', employees[i].pin);
            td3.appendChild(input3);

            var td4 = document.createElement('td');
            var input4 = document.createElement('input');
            input4.setAttribute('type', 'checkbox');
            input4.setAttribute('id', 'ex' + employees[i].id);
            input4.checked = employees[i].ex;
            td4.appendChild(input4);

            var td5 = document.createElement('td');
            var input5 = document.createElement('input');
            input5.setAttribute('type', 'button');
            input5.setAttribute('value', 'Update');
            input5.setAttribute('onclick', 'alert("Update in DB"');
            td5.appendChild(input5);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            employeelist.appendChild(tr);
        }


        //Add new!
        var tr = document.createElement("tr");

        var th = document.createElement('th');
        th.setAttribute('scope', 'row');
        th.innerHTML = '0';

        var td1 = document.createElement('td');
        var input1 = document.createElement('input');
        input1.setAttribute('type', 'text');
        input1.setAttribute('id', 'name0');
        input1.setAttribute('value', '');
        td1.appendChild(input1);

        var td2 = document.createElement('td');
        var input2 = document.createElement('input');
        input2.setAttribute('type', 'text');
        input2.setAttribute('id', 'contact0');
        input2.setAttribute('value', '');
        td2.appendChild(input2);

        var td3 = document.createElement('td');
        var input3 = document.createElement('input');
        input3.setAttribute('type', 'text');
        input3.setAttribute('id', 'pin0');
        input3.setAttribute('value', '');
        td3.appendChild(input3);

        var td4 = document.createElement('td');
        var input4 = document.createElement('input');
        input4.setAttribute('type', 'checkbox');
        input4.setAttribute('id', 'ex0');
        td4.appendChild(input4);

        var td5 = document.createElement('td');
        var input5 = document.createElement('input');
        input5.setAttribute('type', 'button');
        input5.setAttribute('value', 'Add');
        input5.setAttribute('onclick', 'alert("Add to DB"');
        td5.appendChild(input5);

        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        employeelist.appendChild(tr);
    });
}

function getSchedule() {
    var dateFrom = getDbFormat(scheduleStart) + ' 00:00:00';
    var dateTo = getDbFormat(scheduleEnd) + ' 23:59:59';

    sendPost("/admin_getschedule", '{ "dateFrom": "' + dateFrom +  '", "dateTo": "'  + dateTo + '" }', function(response) {
        var schedule = JSON.parse(response);

        var schedulelist = document.getElementById('schedulelist');

        for(var i = 0; i < schedule.length; i++) {
            var tr = document.createElement("tr");

            var name = document.createElement('th');
            name.setAttribute('scope', 'row');
            name.innerHTML = schedule[i].name;

            var monday = document.createElement('td');
            monday.innerHTML = '1';

            var tuesday = document.createElement('td');
            tuesday.innerHTML = '2';

            var wednesday = document.createElement('td');
            wednesday.innerHTML = '3';

            var thursday = document.createElement('td');
            thursday.innerHTML = '4';

            var friday = document.createElement('td');
            friday.innerHTML = '5';

            var saturday = document.createElement('td');
            saturday.innerHTML = '6';

            var sunday = document.createElement('td');
            sunday.innerHTML = '7';

            var total = document.createElement('td');
            total.innerHTML = '40';

            tr.appendChild(name);
            tr.appendChild(monday);
            tr.appendChild(tuesday);
            tr.appendChild(wednesday);
            tr.appendChild(thursday);
            tr.appendChild(friday);
            tr.appendChild(saturday);
            tr.appendChild(sunday);
            tr.appendChild(total);

            schedulelist.appendChild(tr);
        }
    });
}

function getScheduleDates() {
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    var scheduleDate = document.getElementById("scheduleDate");
    var d = new Date();
    var day = d.getDay();

    if (day == 0) {
        scheduleStart.setDate( d.getDate() - 6 );
    } else {
        scheduleStart.setDate( d.getDate() - (day - 1) );
    }
    scheduleEnd.setDate(scheduleStart.getDate() + 6);

    var from = pad(scheduleStart.getDate()) + ' ' + months[scheduleStart.getMonth()] + ' ' + scheduleStart.getFullYear();
    var to = pad(scheduleEnd.getDate()) + ' ' + months[scheduleEnd.getMonth()] + ' ' + scheduleEnd.getFullYear();
    scheduleDate.innerHTML = ' ' + from + ' <---> ' + to + ' ';
}