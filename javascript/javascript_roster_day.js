var roles = [
  {"name": "FOH", "colour": "#303F9F", "textcolour": "white"},
  {"name": "Open", "colour": "#43A047", "textcolour": "white"},
  {"name": "Close", "colour": "#F4511E", "textcolour": "white"},
  {"name": "Sandwich", "colour": "#FFE0B2", "textcolour": "black"},
  {"name": "Cook", "colour": "white", "textcolour": "black"},
  {"name": "Sandwich/Cook", "colour": "#D7CCC8", "textcolour": "black"},
  {"name": "Dishwasher", "colour": "#4DD0E1", "textcolour": "black"},
  {"name": "Manager", "colour": "#2196F3", "textcolour": "white"},
  {"name": "Training", "colour": "#673AB7", "textcolour": "white"},
  {"name": "Annual Leave", "colour": "#F48FB1", "textcolour": "black"},
  {"name": "Sick", "colour": "black", "textcolour": "white"}];

function clearTable() {
  var roster_dayview = document.getElementById('roster_dayview');

  roster_dayview.innerHTML = '';
}

function drawTable() {
  clearTable();
  
  var roster_dayview = document.getElementById('roster_dayview');

  var table = document.createElement('table');
  table.setAttribute('width', '1440px');
  table.setAttribute('border', '1');

  table.appendChild(getHeaderRow());

  for(var i = 0; i < employeestimes.length; i++)
  {
    table.appendChild(getEmployeeRow(employeestimes[i]));
  }

  //table.appendChild(getFooterRow());

  roster_dayview.appendChild(table);
}
  
function getHeaderRow() {
  var row = createRow();
  row.appendChild(createHeader('Employee', 160));

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

function getFooterRow() {
  var row = createRow();
  row.classList.add('hidden-print');
  row.appendChild(createHeader('Totals', 160));
  var totalHours = 0;

  for(var i = 0; i < rosterdates.length; i++)
  {
    var totalDayHours = 0;

    for(var x = 0; x < employeestimes.length; x++) {
      for(var y = 0; y < employeestimes[x].times.length; y++) {
        if (employeestimes[x].times[y].date == rosterdates[i]) {
          var start = new Date('1970-01-01');
          start.setHours(employeestimes[x].times[y].start.split(':')[0]);
          start.setMinutes(employeestimes[x].times[y].start.split(':')[1]);

          var end = new Date('1970-01-01');
          end.setHours(employeestimes[x].times[y].end.split(':')[0]);
          end.setMinutes(employeestimes[x].times[y].end.split(':')[1]);

          var totalMilliSeconds = Math.abs(end - start);
          var hours = totalMilliSeconds / 36e5;

          totalDayHours += hours;
          totalHours += hours;
        }
      }
    }

    row.appendChild(createHeader(totalDayHours));
  }

  row.appendChild(createHeader(totalHours));

  return row;
}

function createHeader(text, width) {
  if (!width) {
    width = 30;
  }

  var header = document.createElement('td');
  header.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: ' + width +  'px;');
  header.innerHTML = text;
  return header;

}
  
function getEmployeeRow(employeetimes) {
  var row = createRow();
  var nameCell = createCell();
  nameCell.innerHTML = employeetimes.name;
  row.appendChild(nameCell);
   
  var timeCell = createCell();
  timeCell.style = 'resize: horizontal; overflow: auto;';
  //timeCell.colSpan = 24;

  for(var x = 0; x < 96; x++) {
    var td = document.createElement('td');
    td.setAttribute('employee_id', employeetimes.id);
    td.setAttribute('time_index', x);
    td.setAttribute('time_set', false);
    td.draggable = false;
    td.ondragstart = function() { return false; };
    td.ondrop = function() { return false; };
    td.onmousedown = function() { select(this); return true; };
    td.onmousemove = function() { select(this); return true; };
    td.onmouseup = function() { save(this); return true; };
    timeCell.appendChild(td);
  }
  //var modal = createModal(modaltarget, employeetimes, rosterdates[i]);
  row.appendChild(timeCell);

  var hours = 0;
  var hourCell = createCell();
  hourCell.innerHTML = hours;
  row.appendChild(hourCell);

  return row;
}
  
function createRow() {
  return document.createElement('tr');
}

function createCell() {
  var cell = document.createElement('td');
  cell.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 30px;');
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

function getTimes(employeeid, date) {
  for(var i = 0; i < employeestimes.length; i++) {
    if (employeestimes[i].id == employeeid) {
      return employeestimes[i].times;
    }
  }
}
  
function getStartTime(employeeid, date) {
  var times = getTimes(employeeid, date);

  if (times) {
    for(var i = 0; i < times.length; i++) {
      if (times[i].date == date) {
        return times[i].start;
      }
    }
  }

  return "09:00";
}

function getEndTime(employeeid, date) {
  var times = getTimes(employeeid, date);

  if (times) {
    for(var i = 0; i < times.length; i++) {
      if (times[i].date == date) {
        return times[i].end;
      }
    }
  }

  return "18:15";
}

function getRole(employeeid, date) {
  var times = getTimes(employeeid, date);

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
  var times = getTimes(employeeid, date);

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

function save(id, date, modaltarget) {
  updateTime(id, date, start.value, finish.value, role.value);

  var request = { 
    id: id,
    date: date,
    start: start.value,
    finish: finish.value,
    role: role.value
  };
  /*sendPost("/saveemployeetimes", JSON.stringify(request), function(response) {
    employeestimes =  JSON.parse(response);
    getEmployeeTimes();
  });*/
}

function deleteit(id, date) {
  var request = { 
    id: id,
    date: date
  };
  /*sendPost("/deleteemployeetimes", JSON.stringify(request), function(response) {
    employeestimes =  JSON.parse(response);
    getEmployeeTimes();
  });*/
}

function rosterBack() {
  var d = new Date(rosterStart);
  d.setDate( d.getDate() - 2 );
  getRosterDate(d);
  getEmployeeTimes();
}

function rosterForward() {
  var d = new Date(rosterStart);
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
    if (day == 0) {
      rosterStart.setDate( rosterStart.getDate() - 6 );
    } else {
        rosterStart.setDate( rosterStart.getDate() - (day - 1) );
    }
    rosterEnd = new Date(rosterStart);
    rosterEnd.setDate(rosterEnd.getDate() + 6);

    var from = pad(rosterStart.getDate()) + ' ' + monthNames[rosterStart.getMonth()] + ' ' + rosterStart.getFullYear();
    var to = pad(rosterEnd.getDate()) + ' ' + monthNames[rosterEnd.getMonth()] + ' ' + rosterEnd.getFullYear();

    rosterDate.innerHTML = ' ' + from;

    rosterdates = [];
    for(var i = 0; i < 7; i++)
    {
      rosterdates.push(rosterStart.getFullYear() + '-' + pad(rosterStart.getMonth()+1) + '-' + pad(rosterStart.getDate()));
      rosterStart.setDate(rosterStart.getDate() + 1);
    }
}

function getEmployeeTimes() {
  var loading = document.getElementById('loading');
  loading.innerHTML = ' Loading...';

  employeestimes = [];
  var request = { date: rosterdates[0] };
  sendPost("/getemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      drawTable();

      var loading = document.getElementById('loading');
      loading.innerHTML = '';
  });
}