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

        while (schedulelist.firstChild) {
            schedulelist.removeChild(schedulelist.firstChild);
        }

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
                    monday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    tuesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    wednesday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    thursday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    friday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    saturday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' },
                    sunday: { workMinutes: 0, restMinutes: 0, mealMinutes: 0, starttime: '', finishtime: '' }
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
            } else if (day == 1) { //monday
                scheduleDays[schedule[i].id].monday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].monday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].monday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].monday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].monday.finishtime = formatTime(schedule[i].finishtime);
            } else if (day == 2) { 
                scheduleDays[schedule[i].id].tuesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].tuesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].tuesday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].tuesday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].tuesday.finishtime = formatTime(schedule[i].finishtime);
            } else if (day == 3) { 
                scheduleDays[schedule[i].id].wednesday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].wednesday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].wednesday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].wednesday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].wednesday.finishtime = formatTime(schedule[i].finishtime);
            } else if (day == 4) { 
                scheduleDays[schedule[i].id].thursday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].thursday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].thursday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].thursday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].thursday.finishtime = formatTime(schedule[i].finishtime);
            } else if (day == 5) { 
                scheduleDays[schedule[i].id].friday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].friday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].friday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].friday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].friday.finishtime = formatTime(schedule[i].finishtime);
            } else if (day == 6) { //saturday
                scheduleDays[schedule[i].id].saturday.workMinutes += workMinutes;
                scheduleDays[schedule[i].id].saturday.restMinutes += restMinutes;
                scheduleDays[schedule[i].id].saturday.mealMinutes += mealMinutes;
                scheduleDays[schedule[i].id].saturday.starttime = formatTime(schedule[i].starttime);
                scheduleDays[schedule[i].id].saturday.finishtime = formatTime(schedule[i].finishtime);
            }
        }

        for(var i in scheduleDays) {
            var tr = document.createElement("tr");

            var name = document.createElement('th');
            name.setAttribute('scope', 'row');
            name.innerHTML = scheduleDays[i].name;

            var workMinutes = 0;
            var paidHours = 0;
            var restMinutes = 0;
            var mealMinutes = 0;

            var monday = document.createElement('td');
            monday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].monday.workMinutes;
            restMinutes = scheduleDays[i].monday.restMinutes;
            mealMinutes = scheduleDays[i].monday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].monday.starttime + ' - ' + scheduleDays[i].monday.finishtime;
            monday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            monday.innerHTML = paidHours;
            totalMonday += workMinutes;

            var tuesday = document.createElement('td');
            tuesday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].tuesday.workMinutes;
            restMinutes = scheduleDays[i].tuesday.restMinutes;
            mealMinutes = scheduleDays[i].tuesday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].tuesday.starttime + ' - ' + scheduleDays[i].tuesday.finishtime;
            tuesday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            tuesday.innerHTML =paidHours;
            totalTuesday += workMinutes;

            var wednesday = document.createElement('td');
            wednesday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].wednesday.workMinutes;
            restMinutes = scheduleDays[i].wednesday.restMinutes;
            mealMinutes = scheduleDays[i].wednesday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].wednesday.starttime + ' - ' + scheduleDays[i].wednesday.finishtime;
            wednesday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            wednesday.innerHTML = paidHours;
            totalWednesday += workMinutes;

            var thursday = document.createElement('td');
            thursday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].thursday.workMinutes;
            restMinutes = scheduleDays[i].thursday.restMinutes;
            mealMinutes = scheduleDays[i].thursday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].thursday.starttime + ' - ' + scheduleDays[i].thursday.finishtime;
            thursday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            thursday.innerHTML = paidHours;
            totalThursday += workMinutes;

            var friday = document.createElement('td');
            friday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].friday.workMinutes;
            restMinutes = scheduleDays[i].friday.restMinutes;
            mealMinutes = scheduleDays[i].friday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].friday.starttime + ' - ' + scheduleDays[i].friday.finishtime;
            friday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            friday.innerHTML = paidHours;
            totalFriday += workMinutes;

            var saturday = document.createElement('td');
            saturday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].saturday.workMinutes;
            restMinutes = scheduleDays[i].saturday.restMinutes;
            mealMinutes = scheduleDays[i].saturday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].saturday.starttime + ' - ' + scheduleDays[i].saturday.finishtime;
            saturday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            saturday.innerHTML = paidHours;
            totalSaturday += workMinutes;

            var sunday = document.createElement('td');
            sunday.style.cssText += 'text-align:center;';
            workMinutes = scheduleDays[i].sunday.workMinutes;
            restMinutes = scheduleDays[i].sunday.restMinutes;
            mealMinutes = scheduleDays[i].sunday.mealMinutes;
            paidHours = calculateHours(workMinutes - mealMinutes);
            time = scheduleDays[i].sunday.starttime + ' - ' + scheduleDays[i].sunday.finishtime;
            sunday.title = 'Time: ' + time +  '\nWork Hours: ' + calculateHours(workMinutes) + 'hrs \nRest Minutes: ' + restMinutes + 'mins \nMeal Minutes: ' + mealMinutes + 'mins';
            sunday.innerHTML = paidHours;
            totalSunday += workMinutes;

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
    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

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

    var from = pad(scheduleStart.getDate()) + ' ' + months[scheduleStart.getMonth()] + ' ' + scheduleStart.getFullYear();
    var to = pad(scheduleEnd.getDate()) + ' ' + months[scheduleEnd.getMonth()] + ' ' + scheduleEnd.getFullYear();
    scheduleDate.innerHTML = ' ' + from + ' <---> ' + to + ' ';
}