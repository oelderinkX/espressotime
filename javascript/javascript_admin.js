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

        var scheduleDays = {};
        var lastEmployeeId = 0;

        for(var i = 0; i < schedule.length; i++) {
            if (!scheduleDays[schedule[i].id])
            {
                scheduleDays[schedule[i].id] = { 
                    name: schedule[i].name,
                    monday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    tuesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    wednesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    thursday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    friday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    saturday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0},
                    sunday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0}
                };
            }

            var workMinutes = calculateMinutes(schedule[i].starttime, schedule[i].finishtime);
            var workDate = new Date(removeZuluTime(schedule[i].starttime));
            var day = workDate.getDay();

            for(var x = 0; x < schedule[i].breaks.length; x++) {
                if (schedule[i].breaks[x].breaktype == 10) {
                    var restMinutes = calculateMinutes(schedule[i].breaks[x].starttime, schedule[i].breaks[x].finishtime);
                } else if (schedule[i].breaks[x].breaktype == 30) {
                    var mealMinutes = calculateMinutes(schedule[i].breaks[x].starttime, schedule[i].breaks[x].finishtime);
                }
            }

            if (day == 0) { //sunday
                scheduleDays[schedule[i].id].sunday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].sunday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].sunday.mealMinutes += mealMinutes;
            } else if (day == 1) { //monday
                scheduleDays[schedule[i].id].monday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].monday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].monday.mealMinutes += mealMinutes;
            } else if (day == 2) { 
                scheduleDays[schedule[i].id].tuesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].tuesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].tuesday.mealMinutes += mealMinutes;
            } else if (day == 3) { 
                scheduleDays[schedule[i].id].wednesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].wednesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].wednesday.mealMinutes += mealMinutes;
            } else if (day == 4) { 
                scheduleDays[schedule[i].id].thursday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].thursday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].thursday.mealMinutes += mealMinutes;
            } else if (day == 5) { 
                scheduleDays[schedule[i].id].friday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].friday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].friday.mealMinutes += mealMinutes;
            } else if (day == 6) { //saturday
                scheduleDays[schedule[i].id].saturday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].saturday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].saturday.mealMinutes += mealMinutes;
            }
        }

        // we NOW need to minus the rest breaks!!!!!
        // oh yeah!!!!!!!!!
        for(var i in scheduleDays) {
            var tr = document.createElement("tr");

            var name = document.createElement('th');
            name.setAttribute('scope', 'row');
            name.innerHTML = scheduleDays[i].name;

            var monday = document.createElement('td');
            monday.title = 'Work Minutes: ' + scheduleDays[i].monday.workMinutes;
            monday.innerHTML = calculateHours(scheduleDays[i].monday.workMinutes - scheduleDays[i].monday.mealMinutes);

            var tuesday = document.createElement('td');
            tuesday.innerHTML = calculateHours(scheduleDays[i].tuesday.workMinutes - scheduleDays[i].tuesday.mealMinutes);

            var wednesday = document.createElement('td');
            wednesday.innerHTML = calculateHours(scheduleDays[i].wednesday.workMinutes - scheduleDays[i].wednesday.mealMinutes);

            var thursday = document.createElement('td');
            thursday.innerHTML = calculateHours(scheduleDays[i].thursday.workMinutes - scheduleDays[i].thursday.mealMinutes);

            var friday = document.createElement('td');
            friday.innerHTML = calculateHours(scheduleDays[i].friday.workMinutes - scheduleDays[i].friday.mealMinutes);

            var saturday = document.createElement('td');
            saturday.innerHTML = calculateHours(scheduleDays[i].saturday.workMinutes - scheduleDays[i].saturday.mealMinutes);

            var sunday = document.createElement('td');
            sunday.innerHTML = calculateHours(scheduleDays[i].sunday.workMinutes - scheduleDays[i].sunday.mealMinutes);

            var totalMinutes = scheduleDays[i].monday.workMinutes
                                + scheduleDays[i].tuesday.workMinutes
                                + scheduleDays[i].wednesday.workMinutes
                                + scheduleDays[i].thursday.workMinutes
                                + scheduleDays[i].friday.workMinutes
                                + scheduleDays[i].saturday.workMinutes
                                + scheduleDays[i].sunday.workMinutes;

            totalMinutes = totalMinutes - scheduleDays[i].monday.mealMinutes
                                        - scheduleDays[i].tuesday.mealMinutes
                                        - scheduleDays[i].wednesday.mealMinutes
                                        - scheduleDays[i].thursday.mealMinutes
                                        - scheduleDays[i].friday.mealMinutes
                                        - scheduleDays[i].saturday.mealMinutes
                                        - scheduleDays[i].sunday.mealMinutes;

            var total = document.createElement('td');
            total.innerHTML = calculateHours(totalMinutes);

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