var timeoffs = { };

function getEmployeeNameById(id) {
    if (timeoffs && timeoffs.employee) {
        for(var i = 0; i < timeoffs.employee.length; i++) {
            if (timeoffs.employee[i].id == id) {
                return timeoffs.employee[i].name;
            }
        }
    }

    return 'unknown employee';
}

function loadTimeOffs() {
    var timeoffapproval =  document.getElementById('timeoffapproval');
    timeoffapproval.style = "display: none";

    var request = {};
    sendPost("/gettimeoffs", JSON.stringify(request), function(response) {
        timeoffs  = JSON.parse(response);
    
        var status = document.getElementById('status');
        status.value = 0;

        loadEmployees();

        displayAllTimeoffs();

        timeoffapproval.style = "display: table;";
    });
}

function loadEmployees() {
    var employees = document.getElementById('employees');
    employees.innerHTML = '';
    var ex = document.getElementById('ex');
    var displayExEmployees = ex.checked;

    var option = document.createElement('option');
    option.value = '0';
    option.innerText = '--- All ---';
    employees.appendChild(option);

    for(var i = 0; i < timeoffs.employee.length; i++) {
        if (timeoffs.employee[i].ex == false || displayExEmployees == true) {
            var option = document.createElement('option');
            option.value = timeoffs.employee[i].id;
            option.innerText = timeoffs.employee[i].name;
            employees.appendChild(option);
        }
    }
    employees.value = 0;
}

function displayAllTimeoffs() {
    const employees = document.getElementById('employees');
    const status = document.getElementById('status');

    const timeoffs_table = document.getElementById('timeoffs');
    timeoffs_table.innerHTML = '';

    const row = document.createElement('tr');
    row.style = 'background: white';

    const heading1 = document.createElement('th');
    heading1.innerText = 'Employee Name';
    row.appendChild(heading1);

    const heading2 = document.createElement('th');
    heading2.innerText = 'Time Off Dates';
    row.appendChild(heading2);

    const heading3 = document.createElement('th');
    heading3.innerText = 'Type';
    row.appendChild(heading3);

    const heading4 = document.createElement('th');
    heading4.innerText = 'Paid';
    row.appendChild(heading4);

    const heading5 = document.createElement('th');
    heading5.innerText = 'Reason';
    row.appendChild(heading5);

    const heading6 = document.createElement('th');
    heading6.innerText = 'Status';
    row.appendChild(heading6);

    timeoffs_table.appendChild(row);

    const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    for(const i = 0; i < timeoffs.timeoff.length; i++) {
        if (employees.value == 0 || employees.value == timeoffs.timeoff[i].employee_id) {
            if (status.value == -1 || status.value == timeoffs.timeoff[i].approved) {
                const row = document.createElement('tr');

                const column1 = document.createElement('td');
                column1.innerText = getEmployeeNameById(timeoffs.timeoff[i].employee_id);
                row.appendChild(column1);
            
                const column2 = document.createElement('td');
                var startDate = new Date(removeZuluTime(timeoffs.timeoff[i].start_date));
                var startDateDay = dayNames[startDate.getDay()];
                var endDate = new Date(removeZuluTime(timeoffs.timeoff[i].end_date));
                var endDateDay = dayNames[endDate.getDay()];
                //var timeOffDates = '' + getDbFormat(startDate) + ' (' + startDateDay + ') to ' + getDbFormat(endDate) + ' (' + endDateDay + ')';
                const timeOffDates = `${formatter.format(startDate)} (${startDateDay}) to ${formatter.format(endDate)} (${endDateDay})`;

                column2.innerText = timeOffDates; 
                row.appendChild(column2);
            
                const column3 = document.createElement('td');
                column3.innerText =  timeoffs.timeoff[i].role;
                row.appendChild(column3);
            
                const column4 = document.createElement('td');
                column4.innerText =  YesOrNo(timeoffs.timeoff[i].paid);
                row.appendChild(column4);
            
                const column5 = document.createElement('td');
                column5.innerText =  timeoffs.timeoff[i].reason;
                row.appendChild(column5);
            
                const column6 = document.createElement('td');

                if (timeoffs.timeoff[i].approved == 0) {
                    column6.innerHTML =  'Pending... <button type="button" onclick="update(' + timeoffs.timeoff[i].id + ',' + timeoffs.timeoff[i].employee_id + ', 1' + ');">Approve</button>';
                } else if (timeoffs.timeoff[i].approved == 1) {
                    column6.innerHTML =  'Approved... <button type="button" onclick="update(' + timeoffs.timeoff[i].id + ',' + timeoffs.timeoff[i].employee_id + ', 0' + ');">Reset Approval...</button>';
                } else if (timeoffs.timeoff[i].approved == 2) {
                    column6.innerText =  'Unapproved: ' + timeoffs.timeoff[i].unapproved_reason;
                }

                row.appendChild(column6);
            
                timeoffs_table.appendChild(row);
            }
        }
    }
}

function update(id, employeeid, approved) {
    var request = {
        id: id,
        employeeid: employeeid,
        approved: approved
    };
    sendPost("/updateapprove", JSON.stringify(request), function(response) {
        loadTimeOffs();
        alert('Approved!');
    });
}