var roles = [
  {"name": "-", "colour": "white", "textcolour": "black"},
  {"name": "FOH", "colour": "#303F9F", "textcolour": "white"},
  {"name": "Open", "colour": "#43A047", "textcolour": "white"},
  {"name": "Close", "colour": "#F4511E", "textcolour": "white"},
  {"name": "Sandwich", "colour": "#FFE0B2", "textcolour": "black"},
  {"name": "Cook", "colour": "yellow", "textcolour": "black"},
  {"name": "Sandwich/Cook", "colour": "#D7CCC8", "textcolour": "black"},
  {"name": "Kitchen Open", "colour": "#FF9900", "textcolour": "black"},
  {"name": "Dishwasher", "colour": "#4DD0E1", "textcolour": "black"},
  {"name": "Manager", "colour": "#2196F3", "textcolour": "white"},
  {"name": "Training", "colour": "#673AB7", "textcolour": "white"},
  {"name": "Annual Leave", "colour": "black", "textcolour": "white"},
  {"name": "Sick", "colour": "black", "textcolour": "white"}];

function clearTable() {
  var roster_dayview = document.getElementById('roster_dayview');

  roster_dayview.innerHTML = '';
}

function drawTable() {
  clearTable();
  
  var roster_dayview = document.getElementById('roster_dayview');

  var table = document.createElement('table');
  table.setAttribute('width', '1800px');
  table.setAttribute('border', '1');

  table.appendChild(getHeaderRow());

  for(var i = 0; i < employeestimes.length; i++)
  {
    table.appendChild(getEmployeeRow(employeestimes[i]));
  }

  roster_dayview.appendChild(table);

  table.appendChild(getFooterRow());
  table.appendChild(getFooterBarRow());
}
  
function getHeaderRow() {
  var row = createRow();
  row.appendChild(createHeader('Employee', 320));
  row.appendChild(createHeader('Role', 160));

  for(var i = 0; i < 24; i++)
  {
    var hour = '';
    if (i < 12) {
      hour = i + ' AM';
    } else {
      if (i == 12) {
        hour = '12 PM'
      } else {
        hour = (i-12) + ' PM'
      }
    }
    var hourHeader = createHeader(hour)
    hourHeader.colSpan = 4;

    row.appendChild(hourHeader);
  }

  hoursHeader = createHeader('Hours', 160);
  row.appendChild(hoursHeader);

  return row;
}

function getFooterBarRow() {
  var row = createRow();
  row.appendChild(createHeader('', 160));
  row.appendChild(createHeader('', 160));
  var totalEmployees = employeestimes.length;

  for(var i = 0; i < 24; i++) {
    var hourCell =  document.querySelector('[hour_total' + i + ']');
    var hours = parseInt(hourCell.innerHTML);
    var cell = createCell();
    cell.colSpan = 4;
    cell.setAttribute('style', 'background-color: white; text-align: center; vertical-align: bottom; height: 40px; width: 30px;');

    //cell.innerHTML = hours + 'x';
    var bar = document.createElement('img');
    bar.width = 30;
    bar.height = 20;
    bar.src = "images/bar.png";
    cell.appendChild(bar);

    row.appendChild(cell);
  }

  row.appendChild(createHeader('', 160));

  return row;
}

function getFooterRow() {
  var row = createRow();
  row.classList.add('hidden-print');
  row.appendChild(createHeader('Totals', 160));
  row.appendChild(createHeader('', 160));
  var totalHours = 0;

  for(var i = 0; i < 96; i += 4) {
    var totalMinutes = 0;
    var slot1 = document.querySelectorAll('[time_index="' + i + '"]');
    var slot2 = document.querySelectorAll('[time_index="' + (i+1) + '"]');
    var slot3 = document.querySelectorAll('[time_index="' + (i+2) + '"]');
    var slot4 = document.querySelectorAll('[time_index="' + (i+3) + '"]');

    for(var x = 0; x < slot1.length; x++) {
      if (slot1[x].getAttribute('time_set') == "true") {
        totalMinutes += 15;
      }
      if (slot2[x].getAttribute('time_set') == "true") {
        totalMinutes += 15;
      }
      if (slot2[x].getAttribute('time_set') == "true") {
        totalMinutes += 15;
      }
      if (slot2[x].getAttribute('time_set') == "true") {
        totalMinutes += 15;
      }
    }

    var cell = createCell();
    cell.colSpan = 4;
    cell.setAttribute('hour_total' + (i/4), calculateHours(totalMinutes));
    cell.innerHTML = calculateHours(totalMinutes);
    row.appendChild(cell);

    totalHours += calculateHours(totalMinutes);
  }
  row.appendChild(createHeader(totalHours));

  return row;
}

function createHeader(text, width) {
  if (!width) {
    width = 30;
  }

  var header = document.createElement('td');
  header.setAttribute('style', 'background-color: white; text-align: center; vertical-align: middle; height: 40px; width: ' + width +  'px;');
  header.innerHTML = text;
  return header;
}
  
function getEmployeeRow(employeetimes) {
  var row = createRow();

  var nameCell = createCell();
  nameCell.innerHTML = employeetimes.name;
  row.appendChild(nameCell);

  var role = getRole(employeetimes.id, rosterdate);
  var roleCell = createCell();
  roleCell.setAttribute('id', 'rolecell_' + employeetimes.id);
  roleCell.style.backgroundColor = getRoleColour(role);
  roleCell.style.color = getRoleTextColour(role);

  var roleSelect = document.createElement('select');
  roleSelect.setAttribute('id', 'roleselect_' + employeetimes.id);
  roleSelect.style = 'background-color: ' + getRoleColour(role) + '; border:none; outline: none;';
  roleSelect.setAttribute('onchange', "updateRole("+ employeetimes.id + ", this);");
  for(var i = 0; i < roles.length; i++) {
    var roleOption = document.createElement('option');
    roleOption.value = roles[i].name;
    roleOption.innerHTML = roles[i].name;
    roleSelect.appendChild(roleOption);
  }
  roleSelect.value = role;
  roleCell.appendChild(roleSelect);

  row.appendChild(roleCell);

  var starttime = new Date(rosterdate);
  var st_split = getStartTime(employeetimes.id, rosterdate).split(':');
  starttime.setHours(parseInt(st_split[0]), parseInt(st_split[1]), 0);

  var endtime = new Date(rosterdate);
  var et_split = getEndTime(employeetimes.id, rosterdate).split(':');
  endtime.setHours(parseInt(et_split[0]), parseInt(et_split[1]), 0);

  for(var x = 0; x < 96; x++) {
    var timeCell = createCell();

    var bartime = new Date(rosterdate);
    bartime.setHours(0,0,0,0);
    bartime.setMinutes(15*x);

    timeCell.setAttribute('employee_id', employeetimes.id);
    timeCell.setAttribute('time_index', x);
    timeCell.setAttribute('role_colour', getRoleColour(role));

    if (starttime.getHours() == 0 && starttime.getMinutes() == 0 && endtime.getHours() == 0 && endtime.getMinutes() == 0) {
      timeCell.style.backgroundColor = 'white';
      timeCell.setAttribute('time_set', false);
    } else if (bartime >= starttime && bartime < endtime) {
      timeCell.style.backgroundColor = getRoleColour(role);
      timeCell.setAttribute('time_set', true);
    } else {
      timeCell.style.backgroundColor = 'white';
      timeCell.setAttribute('time_set', false);
    }

    timeCell.draggable = false;
    timeCell.ondragstart = function() { return false; };
    timeCell.ondrop = function() { return false; };
    timeCell.onmousedown = function() { select(this); return true; };
    timeCell.onmousemove = function() { select(this); return true; };
    timeCell.onmouseup = function() { save(this); return true; };

    row.appendChild(timeCell);
  }

  var hours = 0;
  var hourCell = createCell();
  hourCell.innerHTML = hours;
  row.appendChild(hourCell);

  return row;
}

function updateRole(id, element, td) {
  var role = element.value;
  var roleCell = document.getElementById('rolecell_' + id);
  roleCell.style.backgroundColor = getRoleColour(role);
  roleCell.style.color = getRoleTextColour(role);

  element.style = 'background-color: ' + getRoleColour(role) + '; border:none; outline: none;';

  if (role == '-') {
    deleteit(id, rosterdate);
  } else {
    var request = { 
      id: id,
      date: rosterdate,
      start: '',
      finish: '',
      role: role
    };

    var times = getTimes(id);
    var timeUpdated = false;

    if (times.length > 0) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == rosterdate) {
          times[i].role = role;
          request.start = times[i].start;
          request.finish = times[i].end;
          timeUpdated = true;
        }
      }
    }

    if (timeUpdated == false) {
      times.push({date: rosterdate, start: '09:00', end: '09:00', role: role});
      request.start = '09:00';
      request.finish = '09:00';
    }

    sendPost("/saveemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      getEmployeeTimes();
    }); 
  }
}

function createRow() {
  return document.createElement('tr');
}

function createCell() {
  var cell = document.createElement('td');
  cell.setAttribute('style', 'background-color: white; text-align: center; vertical-align: middle; height: 40px; width: 30px;');
  return cell;
}
  
function createTimeBar() {
  var control = document.createElement('div');
  control.setAttribute('class', 'btn');

  var styles = 'display:inline-block; ';
  styles += 'width: 20px; ';
  styles += 'height: 40px; ';
  styles += 'width: 100%; ';
  styles += 'white-space: normal; ';
  styles += 'padding: 3px 12px; ';
  styles += 'font-size: 13px; ';

  control.setAttribute('style', styles);
  control.setAttribute('data-toggle', 'modal');

  return control;
}

function getRoleColour(role) {
  for(var i = 0; i < roles.length; i++) {
    if (roles[i].name.toLowerCase() == role.toLowerCase()) {
      return roles[i].colour;
    }
  }
}

function getRoleTextColour(role) {
  for(var i = 0; i < roles.length; i++) {
    if (roles[i].name.toLowerCase() == role.toLowerCase()) {
      return roles[i].textcolour;
    }
  }
}

function getTimes(employeeid) {
  for(var i = 0; i < employeestimes.length; i++) {
    if (employeestimes[i].id == employeeid) {
      return employeestimes[i].times;
    }
  }
}
  
function getStartTime(employeeid, date) {
  var times = getTimes(employeeid);

  if (times) {
    for(var i = 0; i < times.length; i++) {
      if (times[i].date == date) {
        return times[i].start;
      }
    }
  }

  return "00:00";
}

function getEndTime(employeeid, date) {
  var times = getTimes(employeeid);

  if (times) {
    for(var i = 0; i < times.length; i++) {
      if (times[i].date == date) {
        return times[i].end;
      }
    }
  }

  return "00:00";
}

function getRole(employeeid, date) {
  var times = getTimes(employeeid);

  if (times) {
    for(var i = 0; i < times.length; i++) {
      if (times[i].date == date) {
        return times[i].role;
      }
    }
  }

  return roles[0].name;
}

function updateTime(employeeid, date, start, finish, role) {
  var times = getTimes(employeeid);

  if (times) {
    if (times.length > 0) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == date) {
          times[i].start = start;
          times[i].end = finish;
          times[i].role = role;
          break;
        }
      }
    } else {
      times.push({
        date: date,
        start: start,
        end: finish,
        role: role
      });
    }
  }
}

function select(element) {
  if (event.buttons > 0) {  // if we are moving the mouse over and mouse button is down
    var start = -1;
    var end = -1;
    var selected = parseInt(element.getAttribute('time_index'));
    var set = element.getAttribute('time_set');
    var selectedBgColour = element.getAttribute('role_colour');
    var employeeid = element.getAttribute('employee_id');
    var tds = document.querySelectorAll('td[employee_id="' + employeeid + '"');

    for(var i = 0; i < tds.length; i++) {
      if (start == -1) {
        if (tds[i].getAttribute('time_set') == "true") {
          start = i;
        }
      } else {
        if (tds[i].getAttribute('time_set') == "false") {
          end = i - 1;
          break;
        }
      }
    }

    if (start == -1 && end == -1) {
      element.style.backgroundColor = selectedBgColour;
      element.setAttribute('time_set', true);
    } else if (start == end && start == selected) {
      element.style.backgroundColor = 'white';
      element.setAttribute('time_set', false);
    } else {
      if (selected > start && selected > end) {
        end = selected;
      } else if (selected < start && selected < end) {
        start = selected;
      } else {
        if ((selected-start) > (end-selected)) {
          if (end == selected) {
            end--;
          } else {
            end = selected;
          }
        } else {
          if (start == selected) {
            start++;
          } else {
            start = selected;
          }
        }
      }

      for(var i = 0; i < tds.length; i++) {
        if (i >= start && i <= end) {
          tds[i].style.backgroundColor = selectedBgColour;
          tds[i].setAttribute('time_set', true);
        } else {
          tds[i].style.backgroundColor = 'white';
          tds[i].setAttribute('time_set', false);
        }
      }
    }
  }
}

function save(element) {
  var start = -1;
  var end = -1;
  var employeeid = element.getAttribute('employee_id');
  var tds = document.querySelectorAll('td[employee_id="' + employeeid + '"');

  for(var i = 0; i < tds.length; i++) {
    if (start == -1) {
      if (tds[i].getAttribute('time_set') == "true") {
        start = i;
      }
    } else {
      if (tds[i].getAttribute('time_set') == "false") {
        end = i - 1;
        break;
      }
    }
  }

  var startDate = new Date();
    var endDate = new Date();

  if (start > -1 && end > -1) {
    startDate.setHours(0,0,0,0);
    startDate.setMinutes(15*start);

    endDate.setHours(0,0,0,0);
    endDate.setMinutes(15*(end+1));
  } else {
    startDate.setHours(0,0,0,0);
    startDate.setMinutes(15*start);

    endDate.setHours(0,0,0,0);
    endDate.setMinutes(15*(start+1));

    if (startDate.getDay() != endDate.getDay()) {
      endDate.setSeconds(endDate.getSeconds()-1);
    }
  }

  var roleSelect = document.getElementById('roleselect_' + employeeid);

  var request = { 
    id: employeeid,
    date: rosterdate,
    start: formatTime(startDate),
    finish: formatTime(endDate),
    role: roleSelect.value
  };

  sendPost("/saveemployeetimes", JSON.stringify(request), function(response) {
    employeestimes =  JSON.parse(response);
    getEmployeeTimes();
  });
}

function deleteit(id, date) {
  var request = { 
    id: id,
    date: date
  };
  sendPost("/deleteemployeetimes", JSON.stringify(request), function(response) {
    employeestimes =  JSON.parse(response);
    getEmployeeTimes();
  });
}

function rosterBack() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()-1);
  getRosterDate(d);
  getEmployeeTimes();
}

function rosterForward() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()+1);
  getRosterDate(d);
  getEmployeeTimes();
}

function getRosterDate(newDate) {
    var rosterDate = document.getElementById("rosterDate");

    var d = new Date();
    if (newDate) {
        d = new Date(newDate);
    }
    var day = d.getDay();

    rosterStart = new Date(d);

    var from = pad(rosterStart.getDate()) + ' ' + monthNames[rosterStart.getMonth()] + ' ' + rosterStart.getFullYear();

    rosterDate.innerHTML = ' ' + from + ' ';

    rosterdate = rosterStart.getFullYear() + '-' + pad(rosterStart.getMonth()+1) + '-' + pad(rosterStart.getDate());
}

function getEmployeeTimes() {
  var loading = document.getElementById('loading');
  loading.innerHTML = ' Loading...';
  var roster_dayview = document.getElementById('roster_dayview');

  roster_dayview.classList.add('disable');

  employeestimes = [];
  var request = { date: rosterdate };
  sendPost("/getemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      drawTable();

      var loading = document.getElementById('loading');
      loading.innerHTML = '';
      roster_dayview.classList.remove('disable');
  });
}