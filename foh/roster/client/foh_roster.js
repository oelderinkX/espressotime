var refreshPageTimer;

var roles = [];

var rosterStart = new Date(); // GLOBAL

function clock() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var ampm = "am";
  m = pad(m);

  if (h > 11) {
      ampm = "pm";
  }

  if (h > 12) {
      h = h - 12;
  }

  document.getElementById('time').innerHTML = h + ":" + m + ' ' + ampm + ' &nbsp;&nbsp;&nbsp;&nbsp;';

  t = setTimeout(function() {
    clock()
  }, 10000);
}

function clearTable() {
  var roster_weekview = document.getElementById('roster_weekview');
  roster_weekview.innerHTML = '';
}

function drawTable() {
  clearTable();
  
  var roster_weekview = document.getElementById('roster_weekview');

  var table = document.createElement('table');
  table.setAttribute('width', '1280px');
  table.setAttribute('border', '1');

  table.appendChild(getHeaderRow());

  for(var i = 0; i < employeestimes.length; i++)
  {
    table.appendChild(getEmployeeRow(employeestimes[i]));
  }

  roster_weekview.appendChild(table);
}

function loadPage() {
  //getRosterDates();
  setRosterDate(new Date());
  var request = {};
  sendPost("/getroles", JSON.stringify(request), function(response) {
    roles =  JSON.parse(response);
    getEmployeeTimes();
  });
}

function getHeaderRow() {
  var row = createRow();
  row.appendChild(createHeader('Employee'));

  for(var i = 0; i < rosterdates.length; i++)
  {
    var headerDate = new Date(rosterdates[i]);
    var dayHeader = createHeader('');

    var link = document.createElement('a');
    link.setAttribute('href', '#' + getDbFormat(headerDate) + '"');
    link.innerHTML = dayNames[headerDate.getDay()] + ' ' + headerDate.getDate();
    dayHeader.appendChild(link);

    row.appendChild(dayHeader);
  }

  return row;
}

function createHeader(text) {
  var header = document.createElement('td');
  header.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
  header.innerHTML = text;
  
  return header;
}
  
function getEmployeeRow(employeetimes) {
  var row = createRow();
  var nameCell = createCell();
  nameCell.innerHTML = employeetimes.name;
  row.appendChild(nameCell);

  for(var i = 0; i < rosterdates.length; i++) {
    var cellInner = '';
    var role = '';
    var backgroundColour = '';
    var textcolour = 'black';

    for(var x = 0; x < employeetimes.times.length; x++) {
      if (employeetimes.times[x].date == rosterdates[i]) {
        role = employeetimes.times[x].role;
        var startStr = employeetimes.times[x].start;
        var start = new Date('1970-01-01');
        start.setHours(startStr.split(':')[0]);
        start.setMinutes(startStr.split(':')[1]);

        var endStr = employeetimes.times[x].end;
        var end = new Date('1970-01-01');
        end.setHours(endStr.split(':')[0]);
        end.setMinutes(endStr.split(':')[1]);

        var startTime = start.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        var finishTime = end.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

        cellInner = startTime + ' - ' + finishTime + ' ' + role;

        backgroundColour = getRoleColour(role);
        textcolour = getRoleTextColour(role);
      }
    }
    
    var cell = createCell();
    var control = createControl();

    control.innerHTML = cellInner;
    control.style.background = backgroundColour;
    control.style.color = textcolour;

    cell.appendChild(control);

    row.appendChild(cell);
  }

  return row;
}
  
function createRow() {
  return document.createElement('tr');
}

function createCell() {
  var cell = document.createElement('td');
  cell.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
  return cell;
}
  
function createControl() {
  var control = document.createElement('div');
  control.setAttribute('class', 'btn');
  control.setAttribute('style', 'display:inline-block; width: 160px; height: 40px; white-space: normal; padding: 3px 12px; font-size: 13px');
  control.setAttribute('width', '100%');

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

function setRosterDate(d)
{
  if (d) {
    rosterStart = new Date(d);
  } else {
    rosterStart = new Date();
  }

  // re-adjust to Sunday
  var day = rosterStart.getDay();
  rosterStart.setDate( rosterStart.getDate() - day ); // set start day to Sunday
  var rosterdatepicker = document.getElementById('rosterdatepicker');
  rosterdatepicker.valueAsDate = rosterStart;

  rosterNew = new Date(rosterStart);

  rosterdates = [];
  for(var i = 0; i < 7; i++)  {
    rosterdates.push(rosterNew.getFullYear() + '-' + pad(rosterNew.getMonth()+1) + '-' + pad(rosterNew.getDate()));
    rosterNew.setDate(rosterNew.getDate() + 1);
  }

  getEmployeeTimes();
}

/*
function rosterBack() {
  var d = new Date(rosterStart);
  d.setDate( d.getDate() - 14 );
  getRosterDates(d);
  getEmployeeTimes();
}

function rosterForward() {
  var d = new Date(rosterStart);
  getRosterDates(d);
  getEmployeeTimes();
}

function getRosterDates(newDate) {
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

    rosterDate.innerHTML = ' ' + from + ' <---> ' + to + ' ';

    rosterdates = [];
    for(var i = 0; i < 7; i++)  {
      rosterdates.push(rosterStart.getFullYear() + '-' + pad(rosterStart.getMonth()+1) + '-' + pad(rosterStart.getDate()));
      rosterStart.setDate(rosterStart.getDate() + 1);
    }
}
*/

function enableRoster() {
  var roster_weekview = document.getElementById('roster_weekview');
  roster_weekview.style.pointerEvents = '';
  roster_weekview.style.opacity = '1';
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

      window.clearTimeout(refreshPageTimer);
      refreshPageTimer = window.setTimeout(function() {
          var randomPage = Math.floor(Math.random() * 4) + 1;
          var refresh = Math.floor(Math.random() * 9007199254740990) + 1;

          if (randomPage == 1) {
              window.location.href = "/?refresh=" + refresh;
          } else if (randomPage == 2) {
              window.location.href = "/how?refresh=" + refresh;
          } else if (randomPage == 3) {
              window.location.href = "/foh_roster?refresh=" + refresh;
          } else if (randomPage == 4) {
              window.location.href = "/tasks?refresh=" + refresh;
          }
      }, 240000);
  });
}