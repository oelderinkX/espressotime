var roles = [];

var rosterStart = new Date(); // GLOBAL

function loadContacts()
{
  var contacts = document.getElementById('contacts');

  var request = { };

  sendPost("/manager_name_contact", JSON.stringify(request), function(response) {
    var namephone =  JSON.parse(response);

    for(var i = 0; i < namephone.length; i++) {
      var row = document.createElement('tr');
      if (i % 2 == 0) {
        row.setAttribute('style', 'background-color: LightGray');
      }      

      var name = document.createElement('td');
      name.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 200px; padding: 4px;');
      name.innerText = namephone[i].name;
      row.appendChild(name);

      var contact = document.createElement('td');
      contact.innerText = namephone[i].contact;
      contact.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 100px; padding: 4px;');
      row.appendChild(contact);

      var call = document.createElement('td');
      call.innerHTML = '<a style="font-size:25px;" class="ah3" href="tel:' + namephone[i].contact + '">&#128222;</a>';
      call.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 50px; padding: 4px;');
      row.appendChild(call);

      var txt = document.createElement('td');
      txt.innerHTML = '<a style="font-size:25px;" class="ah3" href="sms:' + namephone[i].contact + '">&#128221;</a>';
      txt.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 50px; padding: 4px;');
      row.appendChild(txt);

      contacts.appendChild(row);
    }
  });
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

function loadRosterPage() {
  setRosterDate(new Date());
  var request = {};
  sendPost("/manager_getroles", JSON.stringify(request), function(response) {
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

  if (day == 0) { // sunday
    rosterStart.setDate( rosterStart.getDate() - 6 ); // set start day to Sunday
  } else {
    rosterStart.setDate( rosterStart.getDate() - (day - 1 ) ); // set start day to Sunday
  }

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
  sendPost("/manager_getemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      drawTable();

      var loading = document.getElementById('loading');
      loading.innerHTML = '';
  });
}

function loadSignInOut() {
  var table = document.getElementById('signinout');
  table.innerHTML = '';

  var request = { date: getDbFormat() }
  sendPost("/manager_signinout", JSON.stringify(request), function(response) {
    var response =  JSON.parse(response);

    var headingRow = document.createElement('tr');
    var nameH = document.createElement('th');
    nameH.innerText = 'Name';
    var startH = document.createElement('th');
    startH.innerText = 'Start';
    var finishH = document.createElement('th');
    finishH.innerText = 'Finish';

    headingRow.appendChild(nameH);
    headingRow.appendChild(startH);
    headingRow.appendChild(finishH);

    table.appendChild(headingRow);

    for(var i=0; i < response.length; i++) {
      var row = document.createElement('tr');

      var name = document.createElement('td');
      name.innerText = response[i].name;
      if (response[i].roster_start.length > 0) {
        name.setAttribute('onclick', "alert('" + response[i].name + " should start at " + formatAMPM(getTime(response[i].roster_start)) + " and finish at " + formatAMPM(getTime(response[i].roster_finish)) + "');");
      } else {
        name.setAttribute('onclick', "alert('" + response[i].name + " is not rostered for today');");
      }
       
      var start = document.createElement('td');
      if (response[i].starttime.length > 0) {
        start.innerText = formatAMPM(getTime(response[i].starttime));
      } else {
        start.innerText = '-';
      }

      var finish = document.createElement('td');
      if (response[i].finishtime.length > 0) {
        finish.innerText = formatAMPM(getTime(response[i].finishtime));
      } else {
        finish.innerText = '-';
      }

      row.appendChild(name);
      row.appendChild(start);
      row.appendChild(finish);

      table.appendChild(row);
    }
  });
}