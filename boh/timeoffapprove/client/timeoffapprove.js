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
    var employees = document.getElementById('employees');
    var status = document.getElementById('status');

    var timeoffs_table = document.getElementById('timeoffs');
    timeoffs_table.innerHTML = '';

    var row = document.createElement('tr');
    row.style = 'background: white';

    var heading = document.createElement('th');
    heading.innerText = 'Employee Name';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Time Off Dates';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Type';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Paid';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Reason';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Status';
    row.appendChild(heading);

    timeoffs_table.appendChild(row);

    for(var i = 0; i < timeoffs.timeoff.length; i++) {
        if (employees.value == 0 || employees.value == timeoffs.timeoff[i].employee_id) {
            if (status.value == -1 || status.value == timeoffs.timeoff[i].approved) {
                var row = document.createElement('tr');

                var column = document.createElement('td');
                column.innerText = getEmployeeNameById(timeoffs.timeoff[i].employee_id);
                row.appendChild(column);
            
                var column = document.createElement('td');
                var startDate = new Date(removeZuluTime(timeoffs.timeoff[i].start_date));
                var startDateDay = dayNames[startDate.getDay()];
                var endDate = new Date(removeZuluTime(timeoffs.timeoff[i].end_date));
                var endDateDay = dayNames[endDate.getDay()];
                var timeOffDates = '' + getDbFormat(startDate) + ' (' + startDateDay + ') to ' + getDbFormat(endDate) + ' (' + endDateDay + ')';
                column.innerText = timeOffDates; 
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].role;
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  YesOrNo(timeoffs.timeoff[i].paid);
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].reason;
                row.appendChild(column);
            
                var column = document.createElement('td');

                if (timeoffs.timeoff[i].approved == 0) {
                    column.innerHTML =  'Pending... <button type="button" onclick="update(' + timeoffs.timeoff[i].id + ',' + timeoffs.timeoff[i].employee_id + ', 1' + ');">Approve</button>';
                } else if (timeoffs.timeoff[i].approved == 1) {
                    column.innerText =  'Approved';
                } else if (timeoffs.timeoff[i].approved == 2) {
                    column.innerText =  'Unapproved: ' + timeoffs.timeoff[i].unapproved_reason;
                }

                row.appendChild(column);
            
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