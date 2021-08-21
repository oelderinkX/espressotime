var scheduleStart = new Date();
var scheduleEnd = new Date();

function getEmployees() {
    var employeelist = document.getElementById('employeelist');
    var showExCheckbox = document.getElementById('showEx');

    while (employeelist.firstChild) {
        employeelist.removeChild(employeelist.firstChild);
    }

    var showEx = showExCheckbox.checked;

    sendPost("/admin_getemployees", '{ "showEx": ' + showEx + ' }', function(response) {
        var employees = JSON.parse(response);

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
            input3.disabled = true;
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
            input5.setAttribute('onclick', 'updateEmployee(' + employees[i].id + ');');
            td5.appendChild(input5);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            employeelist.appendChild(tr);
        }

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
        input3.setAttribute('value', '1234');
        input3.disabled = true;
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
        input5.setAttribute('onclick', 'addEmployee();');
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

function updateEmployee(id) {
    var name = document.getElementById('name' + id).value;
    var contact = document.getElementById('contact' + id).value;
    var pin = document.getElementById('pin' + id).value;
    var ex = document.getElementById('ex' + id).checked;

    var json = '{ "employeeId": "' + id +  '", "employeeName": "' + name + '", "employeeContact": "' + contact + '", "employeePin": "' + pin + '", "employeeEx": ' + ex + ' }';

    sendPost("/updateemployee", json, function(response) {
        getEmployees();
    });
}

function addEmployee() {
    var name = document.getElementById('name0').value;
    var contact = document.getElementById('contact0').value;
    var pin = document.getElementById('pin0').value;
    var ex = document.getElementById('ex0').checked;

    if (name.length == 0 || contact.length == 0 || pin.length == 0) {
        alert('All new employees need a name, contact number and pin');
    } else {
        var json = '{ "employeeName": "' + name + '", "employeeContact": "' + contact + '", "employeePin": "' + pin + '", "employeeEx": ' + ex + ' }';

        sendPost("/addemployee", json, function(response) {
            getEmployees();
        });
    }
}

function getSchedule() {
    var dateFrom = getDbFormat(scheduleStart) + ' 00:00:00';
    var dateTo = getDbFormat(scheduleEnd) + ' 23:59:59';

    var schedulelist = document.getElementById('schedulelist');

    while (schedulelist.firstChild) {
        schedulelist.removeChild(schedulelist.firstChild);
    }

    sendPost("/admin_getschedule", '{ "dateFrom": "' + dateFrom +  '", "dateTo": "'  + dateTo + '" }', function(response) {
        var schedule = JSON.parse(response);

        var scheduleDays = {};
        var lastEmployeeId = 0;

        var totalMonday = 0;
        var totalTuesday = 0;
        var totalWednesday = 0;
        var totalThursday = 0;
        var totalFriday = 0;
        var totalSaturday = 0;
        var totalSunday = 0;
        var totalTotal = 0;

        for(var i = 0; i < schedule.length; i++) {
            if (!scheduleDays[schedule[i].id])
            {
                scheduleDays[schedule[i].id] = { 
                    name: schedule[i].name,
                    monday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: [] },
                    tuesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  },
                    wednesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  },
                    thursday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  },
                    friday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  },
                    saturday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  },
                    sunday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '', starttimes: [], finishtimes: []  }
                };
            }

            var workMinutes = calculateMinutes(schedule[i].starttime, schedule[i].finishtime);
            var workDate = new Date(removeZuluTime(schedule[i].starttime));
            var day = workDate.getDay();

            var restMinutes = 0;
            var mealMinutes = 0;
            for(var x = 0; x < schedule[i].breaks.length; x++) {
                if (schedule[i].breaks[x].breaktype == 10) {
                    restMinutes += calculateMinutes(schedule[i].breaks[x].starttime, schedule[i].breaks[x].finishtime);
                } else if (schedule[i].breaks[x].breaktype == 30) {
                    mealMinutes += calculateMinutes(schedule[i].breaks[x].starttime, schedule[i].breaks[x].finishtime);
                }
            }

            if (day == 0) { //sunday
                scheduleDays[schedule[i].id].sunday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].sunday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].sunday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].sunday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].sunday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].sunday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].sunday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 1) { //monday
                scheduleDays[schedule[i].id].monday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].monday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].monday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].monday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].monday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].monday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].monday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 2) { 
                scheduleDays[schedule[i].id].tuesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].tuesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].tuesday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].tuesday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].tuesday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].tuesday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].tuesday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 3) { 
                scheduleDays[schedule[i].id].wednesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].wednesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].wednesday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].wednesday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].wednesday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].wednesday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].wednesday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 4) { 
                scheduleDays[schedule[i].id].thursday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].thursday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].thursday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].thursday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].thursday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].thursday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].thursday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 5) { 
                scheduleDays[schedule[i].id].friday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].friday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].friday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].friday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].friday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].friday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].friday.finishtimes.push(formatTime(schedule[i].finishtime));
            } else if (day == 6) { //saturday
                scheduleDays[schedule[i].id].saturday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].saturday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].saturday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].saturday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].saturday.finishtime = formatTime(schedule[i].finishtime);
                scheduleDays[schedule[i].id].saturday.starttimes.push(formatTime(schedule[i].starttime));
                scheduleDays[schedule[i].id].saturday.finishtimes.push(formatTime(schedule[i].finishtime));
            }
        }

        for(var i in scheduleDays) {
            var tr = document.createElement("tr");

            var name = document.createElement('th');
            name.setAttribute('scope', 'row');
            name.innerHTML = scheduleDays[i].name;

            var workMinutes = 0;
            var paidMinutes = 0;
            var restMinutes = 0;
            var mealMinutes = 0;

            var monday = document.createElement('td');
            monday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].monday.workMinutes;
            restMinutes = scheduleDays[i].monday.restMinutes;
            mealMinutes = scheduleDays[i].monday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].monday.starttimes.length; x++) {
                time += scheduleDays[i].monday.starttimes[x] + ' - ' + scheduleDays[i].monday.finishtimes[x] + '\n';
            }
            monday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            monday.innerHTML = calculateHours(paidMinutes);
            totalMonday += paidMinutes;

            var tuesday = document.createElement('td');
            tuesday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].tuesday.workMinutes;
            restMinutes = scheduleDays[i].tuesday.restMinutes;
            mealMinutes = scheduleDays[i].tuesday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].tuesday.starttimes.length; x++) {
                time += scheduleDays[i].tuesday.starttimes[x] + ' - ' + scheduleDays[i].tuesday.finishtimes[x] + '\n';
            }
            tuesday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            tuesday.innerHTML = calculateHours(paidMinutes);
            totalTuesday += paidMinutes;

            var wednesday = document.createElement('td');
            wednesday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].wednesday.workMinutes;
            restMinutes = scheduleDays[i].wednesday.restMinutes;
            mealMinutes = scheduleDays[i].wednesday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].wednesday.starttimes.length; x++) {
                time += scheduleDays[i].wednesday.starttimes[x] + ' - ' + scheduleDays[i].wednesday.finishtimes[x] + '\n';
            }
            wednesday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            wednesday.innerHTML = calculateHours(paidMinutes);
            totalWednesday += paidMinutes;

            var thursday = document.createElement('td');
            thursday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].thursday.workMinutes;
            restMinutes = scheduleDays[i].thursday.restMinutes;
            mealMinutes = scheduleDays[i].thursday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].thursday.starttimes.length; x++) {
                time += scheduleDays[i].thursday.starttimes[x] + ' - ' + scheduleDays[i].thursday.finishtimes[x] + '\n';
            }
            thursday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            thursday.innerHTML = calculateHours(paidMinutes);
            totalThursday += paidMinutes;

            var friday = document.createElement('td');
            friday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].friday.workMinutes;
            restMinutes = scheduleDays[i].friday.restMinutes;
            mealMinutes = scheduleDays[i].friday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].friday.starttimes.length; x++) {
                time += scheduleDays[i].friday.starttimes[x] + ' - ' + scheduleDays[i].friday.finishtimes[x] + '\n';
            }
            friday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            friday.innerHTML = calculateHours(paidMinutes);
            totalFriday += paidMinutes;

            var saturday = document.createElement('td');
            saturday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].saturday.workMinutes;
            restMinutes = scheduleDays[i].saturday.restMinutes;
            mealMinutes = scheduleDays[i].saturday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].saturday.starttimes.length; x++) {
                time += scheduleDays[i].saturday.starttimes[x] + ' - ' + scheduleDays[i].saturday.finishtimes[x] + '\n';
            }
            saturday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            saturday.innerHTML = calculateHours(paidMinutes);
            totalSaturday += paidMinutes;

            var sunday = document.createElement('td');
            sunday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].sunday.workMinutes;
            restMinutes = scheduleDays[i].sunday.restMinutes;
            mealMinutes = scheduleDays[i].sunday.mealMinutes;
            paidMinutes = workMinutes - mealMinutes;
            time = '';
            for(var x = 0; x < scheduleDays[i].sunday.starttimes.length; x++) {
                time += scheduleDays[i].sunday.starttimes[x] + ' - ' + scheduleDays[i].sunday.finishtimes[x] + '\n';
            }
            sunday.title = 'Time: ' + time +  'Work Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            sunday.innerHTML = calculateHours(paidMinutes);
            totalSunday += paidMinutes;

            var totalWorkMinutes = scheduleDays[i].monday.workMinutes
                                + scheduleDays[i].tuesday.workMinutes
                                + scheduleDays[i].wednesday.workMinutes
                                + scheduleDays[i].thursday.workMinutes
                                + scheduleDays[i].friday.workMinutes
                                + scheduleDays[i].saturday.workMinutes
                                + scheduleDays[i].sunday.workMinutes;

            var totalPaidMinutes = totalWorkMinutes - scheduleDays[i].monday.mealMinutes
                                        - scheduleDays[i].tuesday.mealMinutes
                                        - scheduleDays[i].wednesday.mealMinutes
                                        - scheduleDays[i].thursday.mealMinutes
                                        - scheduleDays[i].friday.mealMinutes
                                        - scheduleDays[i].saturday.mealMinutes
                                        - scheduleDays[i].sunday.mealMinutes;

            var total = document.createElement('td');
            total.style.cssText += 'text-align:center;';
            total.innerHTML = calculateHours(totalPaidMinutes);
            total.title = 'Total Work Hours: ' + calculateHours(totalWorkMinutes);

            totalTotal += totalPaidMinutes;

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

        var tr2 = document.createElement("tr");
        var totalth = document.createElement('th');
        totalth.innerHTML = "Total";
        
        var mondayTotal = document.createElement('td');
        mondayTotal.style.cssText += 'text-align:center;';
        mondayTotal.innerHTML = calculateHours(totalMonday);
        
        var tuesdayTotal = document.createElement('td');
        tuesdayTotal.style.cssText += 'text-align:center;';
        tuesdayTotal.innerHTML = calculateHours(totalTuesday);

        var wednesdayTotal = document.createElement('td');
        wednesdayTotal.style.cssText += 'text-align:center;';
        wednesdayTotal.innerHTML = calculateHours(totalWednesday);
        
        var thursdayTotal = document.createElement('td');
        thursdayTotal.style.cssText += 'text-align:center;';
        thursdayTotal.innerHTML = calculateHours(totalThursday);

        var fridayTotal = document.createElement('td');
        fridayTotal.style.cssText += 'text-align:center;';
        fridayTotal.innerHTML = calculateHours(totalFriday);
        
        var saturdayTotal = document.createElement('td');
        saturdayTotal.style.cssText += 'text-align:center;';
        saturdayTotal.innerHTML = calculateHours(totalSaturday);

        var sundayTotal = document.createElement('td');
        sundayTotal.style.cssText += 'text-align:center;';
        sundayTotal.innerHTML = calculateHours(totalSunday);

        var totalTotalTd = document.createElement('td');
        totalTotalTd.style.cssText += 'text-align:center;';
        totalTotalTd.innerHTML = calculateHours(totalTotal);

        tr2.appendChild(totalth);
        tr2.appendChild(mondayTotal);
        tr2.appendChild(tuesdayTotal);
        tr2.appendChild(wednesdayTotal);
        tr2.appendChild(thursdayTotal);
        tr2.appendChild(fridayTotal);
        tr2.appendChild(saturdayTotal);
        tr2.appendChild(sundayTotal);
        tr2.appendChild(totalTotalTd);
        
        schedulelist.appendChild(tr2);
    });
}

function scheduleBack() {
    var d = scheduleStart;
    d.setDate(d.getDate() - 7);
    getScheduleDates(d);
    getSchedule();
}

function scheduleForward() {
    var d = scheduleStart;
    d.setDate(d.getDate() + 7);
    getScheduleDates(d);
    getSchedule();
}

function getScheduleDates(newDate) {
    var scheduleDate = document.getElementById("scheduleDate");

    var d = new Date();
    if (newDate) {
        d = new Date(newDate);
    }
    var day = d.getDay();

    scheduleStart = new Date(d);
    if (day == 0) {
        scheduleStart.setDate( scheduleStart.getDate() - 6 );
    } else {

        scheduleStart.setDate( scheduleStart.getDate() - (day - 1) );
    }
    scheduleEnd = new Date(scheduleStart);
    scheduleEnd.setDate(scheduleEnd.getDate() + 6);

    var from = pad(scheduleStart.getDate()) + ' ' + monthNames[scheduleStart.getMonth()] + ' ' + scheduleStart.getFullYear();
    var to = pad(scheduleEnd.getDate()) + ' ' + monthNames[scheduleEnd.getMonth()] + ' ' + scheduleEnd.getFullYear();
    scheduleDate.innerHTML = ' ' + from + ' <---> ' + to + ' ';
}

function getTasks() {
    var tasklist = document.getElementById('tasklist');
    var showOldTasksCheckbox = document.getElementById('showOldTasks');

    while (tasklist.firstChild) {
        tasklist.removeChild(tasklist.firstChild);
    }

    var showOld = showOldTasksCheckbox.checked;

    sendPost("/admin_gettasks", '{ "showOld": ' + showOld + ' }', function(response) {
        var tasks = JSON.parse(response);

        for(var i = 0; i < tasks.length; i++) {
            var tr = document.createElement("tr");

            var th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.innerHTML = tasks[i].id;

            var td1 = document.createElement('td');
            var input1 = document.createElement('input');
            input1.setAttribute('type', 'text');
            input1.setAttribute('id', 'name' + tasks[i].id);
            input1.setAttribute('value', tasks[i].name);
            td1.appendChild(input1);

            var td2 = document.createElement('td');
            var textarea2 = document.createElement('textarea');
            textarea2.setAttribute('id', 'description' + tasks[i].id);
            textarea2.setAttribute('rows', '4');
            textarea2.setAttribute('cols', '60');
            textarea2.innerHTML = tasks[i].description;
            td2.appendChild(textarea2);

            var td3 = document.createElement('td');
            var input3 = document.createElement('input');
            input3.setAttribute('type', 'text');
            input3.setAttribute('id', 'starttime' + tasks[i].id);
            input3.setAttribute('value', tasks[i].starttime);
            td3.appendChild(input3);

            var td4 = document.createElement('td');
            var input4 = document.createElement('input');
            input4.setAttribute('type', 'button');
            input4.setAttribute('value', 'Update');
            input4.setAttribute('onclick', 'updateTask(' + tasks[i].id + ');');
            td4.appendChild(input4);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);

            tasklist.appendChild(tr);
        }

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
        var textarea2 = document.createElement('textarea');
        textarea2.setAttribute('id', 'description0');
        textarea2.setAttribute('rows', '4');
        textarea2.setAttribute('cols', '60');
        td2.appendChild(textarea2);

        var td3 = document.createElement('td');
        var input3 = document.createElement('input');
        input3.setAttribute('type', 'text');
        input3.setAttribute('id', 'starttime0');
        input3.setAttribute('value', '09:00:00');
        td3.appendChild(input3);

        var td4 = document.createElement('td');
        var input4 = document.createElement('input');
        input4.setAttribute('type', 'button');
        input4.setAttribute('value', 'Add');
        input4.setAttribute('onclick', 'addTask();');
        td4.appendChild(input4);

        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);

        tasklist.appendChild(tr);
    });
}

function updateTask(id) {
    var timeRegEx = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    var name = document.getElementById('name' + id).value;
    var description = document.getElementById('description' + id).value;
    var starttime = document.getElementById('starttime' + id).value;

    if (name.length == 0 || description.length == 0) {
        alert('Make sure you have enter the name and description of the task');
    } else if (starttime.length != 0 && timeRegEx.test(starttime) == false) {
        alert('Incorrect start time of task.  Use format like 09:00:00 for 9am, or 13:30:00 for 1:30pm.  Leave empty to delete task');
    } else {
        if (starttime.length == 0) {
            starttime = '00:00:00';
        }

        var json = { "id": id, "name": name, "description": description, "starttime": starttime };

        sendPost("/updatetask", JSON.stringify(json), function(response) {
            getTasks();
        });
    }
}

function addTask() {
    var timeRegEx = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;

    var name = document.getElementById('name0').value;
    var description = document.getElementById('description0').value;
    var starttime = document.getElementById('starttime0').value;

    if (name.length == 0 || description.length == 0) {
        alert('Make sure you have enter the name and description of the task');
    } else if (starttime.length != 0 && timeRegEx.test(starttime) == false) {
        alert('Incorrect start time of task.  Use format like 09:00:00 for 9am, or 13:30:00 for 1:30pm.  Leave empty to delete task');
    } else {
        var json = { "name": name, "description": description, "starttime": starttime };

        sendPost("/addtask", JSON.stringify(json), function(response) {
            getTasks();
        });
    }
}