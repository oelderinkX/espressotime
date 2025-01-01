var roles = [];

var rosterStart = new Date(); // GLOBAL

function clearTable() {
  var roster_weekview = document.getElementById('roster_weekview');
  var modals = document.getElementById('modals');

  roster_weekview.innerHTML = '';
  modals.innerHTML = '';
}

function drawTable() {
  clearTable();
  
  var roster_weekview = document.getElementById('roster_weekview');

  var table = document.createElement('table');
  table.setAttribute('width', '1440px');
  table.setAttribute('border', '1');

  table.appendChild(getHeaderRow());

  for(var i = 0; i < employeestimes.length; i++)
  {
    table.appendChild(getEmployeeRow(employeestimes[i]));
  }

  table.appendChild(getFooterRow());

  roster_weekview.appendChild(table);
}

function loadPage() {
  getRosterDates();
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
    //link.classList.add('hidden-print');
    link.setAttribute('href', 'roster?view=day&date="' + getDbFormat(headerDate) + '"');
    link.innerHTML = dayNames[headerDate.getDay()] + ' ' + headerDate.getDate();
    dayHeader.appendChild(link);

    row.appendChild(dayHeader);
  }

  hoursHeader = createHeader('Hours');
  hoursHeader.classList.add('hidden-print');
  row.appendChild(hoursHeader);

  return row;
}

function getFooterRow() {
  var row = createRow();
  row.classList.add('hidden-print');
  row.appendChild(createHeader('Totals'));
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

  var hours = 0;
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

        var totalMilliSeconds = Math.abs(end - start);
        var totalHours = totalMilliSeconds / 36e5;
        hours += totalHours;
      }
    }
    
    var cell = createCell();
    var control = createControl();

    control.innerHTML = cellInner;
    control.style.background = backgroundColour;
    control.style.color = textcolour;

    control.setAttribute('employee_id', employeetimes.id);
    control.setAttribute('cell_date', rosterdates[i]);

    var modaltarget = i + '_' + employeetimes.id;
    control.setAttribute('data-target', '#' + modaltarget);

    if (cellInner.length > 0) { //has a date and role so is draggable
      control.draggable = true;
      control.addEventListener("dragstart", dragstart_handler);
    } else {  // has no date so is dropable
      control.setAttribute('ondragover', 'dragover_handler(event)');
      control.setAttribute('ondrop', 'drop_handler(event)');
    }

    var modal = createModal(modaltarget, employeetimes, rosterdates[i]);

    cell.appendChild(control);

    row.appendChild(cell);
  }

  var hourCell = createCell();
  hourCell.classList.add('hidden-print');
  hourCell.innerHTML = hours;

  row.appendChild(hourCell);

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
  control.setAttribute('data-toggle', 'modal');

  return control;
}
  
function createModal(modaltarget, employeetimes, date) {
  var modals = document.getElementById('modals');

  var modal = document.createElement('div');
  modal.setAttribute('class', 'modal fade');
  modal.setAttribute('id', modaltarget);
  modal.setAttribute('role', 'dialog');

  var modaldialog = document.createElement('div');
  modaldialog.setAttribute('class', 'modal-dialog');

  var modalcontent = document.createElement('div');
  modalcontent.setAttribute('class', 'modal-content');

  var modalheader = document.createElement('div');
  modalheader.setAttribute('class', 'modal-header');

  var title = document.createElement('h4');
  title.setAttribute('class', 'modal-title');
  title.innerHTML = 'Edit Shift for ' + employeetimes.name + ' ' + date;

  modalheader.appendChild(title);

  var modalbody = document.createElement('div');
  modalbody.setAttribute('class', 'modal-body');

  var p = document.createElement('p');

  var startlabel = document.createElement('label');
  startlabel.setAttribute('for', 'start_' + modaltarget);
  startlabel.innerHTML = 'Start Time:';
  p.appendChild(startlabel);

  var startinput = document.createElement('input');
  startinput.setAttribute('type', 'time');
  startinput.setAttribute('class', 'form-control');
  startinput.setAttribute('step', 900);
  startinput.setAttribute('id', 'start_' + modaltarget);
  startinput.value = getStartTime(employeetimes.id, date);
  p.appendChild(startinput);

  var finishlabel = document.createElement('label');
  finishlabel.setAttribute('for', 'finish_' + modaltarget);
  finishlabel.innerHTML = 'Finish Time:';
  p.appendChild(finishlabel);

  var finishinput = document.createElement('input');
  finishinput.setAttribute('type', 'time');
  finishinput.setAttribute('class', 'form-control');
  finishinput.setAttribute('step', 900);
  finishinput.setAttribute('id', 'finish_' + modaltarget);
  finishinput.value = getEndTime(employeetimes.id, date);
  p.appendChild(finishinput);

  var rolelabel = document.createElement('label');
  rolelabel.setAttribute('for', 'role_' + modaltarget);
  rolelabel.innerHTML = 'Role:';
  p.appendChild(rolelabel);

  var roleselect = document.createElement('select');
  roleselect.setAttribute('type', 'text');
  roleselect.setAttribute('class', 'form-control');
  roleselect.setAttribute('id', 'role_' + modaltarget);

  for(var i = 0; i < roles.length; i++) {
    var roleoption = document.createElement('option');
    roleoption.value = roles[i].name;
    roleoption.innerHTML = roles[i].name; 

    roleselect.appendChild(roleoption);
  }
  roleselect.value = getRole(employeetimes.id, date);

  p.appendChild(roleselect);

  modalbody.appendChild(p);

  var modalfooter = document.createElement('div');
  modalfooter.setAttribute('class', 'modal-footer');

  var cancel = document.createElement('button');
  cancel.setAttribute('type', 'button');
  cancel.setAttribute('class', 'btn btn-default');
  cancel.setAttribute('data-dismiss', 'modal');
  cancel.innerHTML = 'Cancel';

  var save = document.createElement('button');
  save.setAttribute('type', 'button');
  save.setAttribute('class', 'btn btn-default');
  save.setAttribute('data-dismiss', 'modal');
  save.innerHTML = 'Save';
  save.setAttribute('onclick', 'save(' + employeetimes.id + ', \'' + date + '\', \'' + modaltarget + '\');');

  var delette = document.createElement('button');
  delette.setAttribute('type', 'button');
  delette.setAttribute('class', 'btn');
  delette.setAttribute('data-dismiss', 'modal');
  delette.style.float = 'left';
  delette.innerHTML = 'Delete';
  delette.setAttribute('onclick', 'deleteit(' + employeetimes.id + ', \'' + date + '\', \'' + modaltarget + '\');');

  modalfooter.appendChild(delette);
  modalfooter.appendChild(cancel);
  modalfooter.appendChild(save);

  modaldialog.appendChild(modalcontent);
  modalcontent.appendChild(modalheader);
  modalcontent.appendChild(modalbody);
  modalcontent.appendChild(modalfooter);
  modal.appendChild(modaldialog);

  modals.appendChild(modal);

  return modal;
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

function dragstart_handler(ev) {
  var employeeid = ev.target.getAttribute("employee_id");
  var celldate = ev.target.getAttribute("cell_date");
  var color = ev.target.style.backgroundColor;
  ev.dataTransfer.setData("text/plain", employeeid + "/" + celldate + "/" + color);
}

function drop_handler(ev) {
  ev.preventDefault();
  var id_and_date = ev.dataTransfer.getData("text/plain");
  var id = id_and_date.split('/')[0];
  var date = id_and_date.split('/')[1];
  var color = id_and_date.split('/')[2];

  var dest_employeeid = ev.target.getAttribute("employee_id");
  var dest_celldate = ev.target.getAttribute("cell_date");

  if (ev.ctrlKey || ev.shiftKey) {
    ev.target.style.backgroundColor = color;
    ev.target.innerHTML = 'Copying...'
  }

  var request = { 
    originalid: id,
    originaldate: date,
    newid: dest_employeeid,
    newdate: dest_celldate,
  };

  if (ev.ctrlKey || ev.shiftKey) {
    sendPost("/copyemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      getEmployeeTimes();
    });
  } else {
    sendPost("/moveemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      getEmployeeTimes();
    });
  }
}

function dragover_handler(ev) {
  ev.preventDefault();

  if (ev.ctrlKey || ev.shiftKey) {
    ev.dataTransfer.dropEffect = "copy";
  } else {
    ev.dataTransfer.dropEffect = "move";
  }
}

function save(id, date, modaltarget) {
  var controlQuery = "[data-target='#" + modaltarget + "']";
  var control = document.querySelector(controlQuery);

  var startId = 'start_' + modaltarget;
  var start = document.getElementById(startId);

  var finishId = 'finish_' + modaltarget;
  var finish = document.getElementById(finishId);

  var roleId = 'role_' + modaltarget;
  var role = document.getElementById(roleId);

  var startUtc = new Date(start.valueAsDate.getUTCFullYear(),
                          start.valueAsDate.getUTCMonth(),
                          start.valueAsDate.getUTCDate(), 
                          start.valueAsDate.getUTCHours(), 
                          start.valueAsDate.getUTCMinutes(), 
                          start.valueAsDate.getUTCSeconds());
  var startTime = startUtc.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

  var finishUtc = new Date(finish.valueAsDate.getUTCFullYear(),
                            finish.valueAsDate.getUTCMonth(),
                            finish.valueAsDate.getUTCDate(), 
                            finish.valueAsDate.getUTCHours(), 
                            finish.valueAsDate.getUTCMinutes(), 
                            finish.valueAsDate.getUTCSeconds());
  var finishTime = finishUtc.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

  control.innerHTML = startTime + ' - ' + finishTime + ' ' +  role.value;

  control.style.background = getRoleColour(role.value);
  control.style.color = getRoleTextColour(role.value);

  updateTime(id, date, start.value, finish.value, role.value);

  var request = { 
    id: id,
    date: date,
    start: start.value,
    finish: finish.value,
    role: role.value
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
    var copylastweekdate = document.getElementById('copylastweekdate');

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

    copylastweekdate.innerHTML = '';
    var lastweekdate = new Date(rosterStart);
    lastweekdate.setDate(lastweekdate.getDate() - 14);
    for(var i = 0; i < 5; i++) {
      var option = document.createElement('option');
      option.value = lastweekdate.getFullYear() + '-' + pad(lastweekdate.getMonth()+1) + '-' + pad(lastweekdate.getDate());
      option.innerHTML = pad(lastweekdate.getDate()) + ' ' + monthNames[lastweekdate.getMonth()] + ' ' + lastweekdate.getFullYear();
      copylastweekdate.appendChild(option);
      lastweekdate.setDate(lastweekdate.getDate() - 7);
    }
}

function disableRoster() {
  var roster_weekview = document.getElementById('roster_weekview');
  roster_weekview.style.pointerEvents = 'none';
  roster_weekview.style.opacity = '0.6';
}

function enableRoster() {
  var roster_weekview = document.getElementById('roster_weekview');
  roster_weekview.style.pointerEvents = '';
  roster_weekview.style.opacity = '1';
}

function isEditMode() {
  var isEditMode = getCookie('roster_editmode');
  return isEditMode;
}

function setEditMode() {
  setCookieTemp('roster_editmode', true)
}

function getEmployeeTimes() {
  var loading = document.getElementById('loading');
  loading.innerHTML = ' Loading...';

  disableRoster();

  employeestimes = [];
  var request = { date: rosterdates[0] };
  sendPost("/getemployeetimes", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);
      drawTable();

      var loading = document.getElementById('loading');
      loading.innerHTML = '';

      if (isEditMode()) {
        enableRoster();
      }
  });
}

function copyLastWeek() {
  var copylastweekdate = document.getElementById('copylastweekdate');
  var fromdate = copylastweekdate.value;
  var fromdatetext = copylastweekdate.options[copylastweekdate.selectedIndex].text;

  if (window.confirm("Are you sure you want to merge " + fromdatetext + " into this week ?")) {
    var request = { date: rosterdates[0], from_date: fromdate };
    sendPost("/copylastweek", JSON.stringify(request), function(response) {
      var result =  JSON.parse(response);

      if (result.success == false) {
        alert('Not able to copy last week because: ' + result.reason);
      }

      getEmployeeTimes();
    });
  }
}