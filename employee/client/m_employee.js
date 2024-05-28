var roles = [
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

var rosterStart = new Date(); // GLOBAL

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

function goRosterBack() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()-7);
  getRosterDates(d);
  loadEmployeeRoster();
}

function goRosterForward() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()+7);
  getRosterDates(d);
  loadEmployeeRoster();
}

function getRosterDates(newDate) {
  var employee_rosterdate = document.getElementById("employee_rosterdate");

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

  employee_rosterdate.innerHTML = ' ' + from + ' - ' + to + ' ';

  rosterdates = [];
  var rostdate = new Date(rosterStart);
  for(var i = 0; i < 7; i++)  {
    rosterdates.push(rostdate.getFullYear() + '-' + pad(rostdate.getMonth()+1) + '-' + pad(rostdate.getDate()));
    rostdate.setDate(rostdate.getDate() + 1);
  }
}

function loadEmployeeRoster() {
  var employee_roster = document.getElementById('employee_roster');

  employeestimes = [];
  var request = { date: rosterdates[0] };

  sendPost("/getemployeeweek", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);

      employee_roster.innerHTML = '';

      for(var i = 0; i < rosterdates.length; i++) {
        var rosterinfo = getTimeByDate(employeestimes, rosterdates[i]);

        var tr = document.createElement('tr');

        var day = document.createElement('td');
        day.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        var d = new Date(rosterinfo.date);
        var dayinner = '';
        dayinner += dayNames[d.getDay()];
        dayinner += ' ';
        dayinner +=  pad(d.getDate());
        day.innerHTML = dayinner;
      
        var time_role = document.createElement('td');
        time_role.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        var timerole = '';
        if (rosterinfo.start.length > 0) {
          timerole += formatAMPM(rosterinfo.start);
          timerole += ' - ';
          timerole += formatAMPM(rosterinfo.end);
          timerole += '<br/>';
          timerole += rosterinfo.role;
        }
        time_role.innerHTML = timerole;
        time_role.style.backgroundColor = getRoleColour(rosterinfo.role);
        time_role.style.color = getRoleTextColour(rosterinfo.role);
 
        tr.appendChild(day);
        tr.appendChild(time_role);

        employee_roster.appendChild(tr);
      }  
  });
}

function getTimeByDate(employeestimes, date) {
  for(var i = 0; i < employeestimes[0].times.length; i++) {
    if (employeestimes[0].times[i].date == date) {
      return employeestimes[0].times[i];
    }
  }

  return {date: date, start: '', end: '', role: ''};
}

function loadBreaks() {
  var breakstable = document.getElementById('breaks');
  breakstable.innerHTML = '';

  breaks = [];
  var today = new Date();
  var request = { date: getDbFormat(today) };

  sendPost("/employee_breaks", JSON.stringify(request), function(response) {
      breaks =  JSON.parse(response);

      for(var i = 0; i < breaks.length; i++) {
        var tr = document.createElement('tr');

        var breaktype = document.createElement('td');
        breaktype.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 40px;');

        var breaktypeicon = '';
        if (breaks[i].breaktype == '10') {
          breaktypeicon = '<span class="glyphicon glyphicon-time"></span>';
        } else {
          breaktypeicon = '<span class="glyphicon glyphicon-cutlery"></span>';
        }
        breaktype.innerHTML = breaktypeicon;

        var startbreak = document.createElement('td');
        startbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 80px;');
        startbreak.innerHTML = '<h4>' + formatAMPM(formatTime(breaks[i].starttime)) + '</h4>';

        var sep = document.createElement('td');
        sep.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 20px;');
        sep.innerHTML = '-';

        var endbreak = document.createElement('td');
        endbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 80px;');
        if (breaks[i].finishtime == '-') {
          endbreak.innerHTML = '';
        } else {
          endbreak.innerHTML = '<h4>' + formatAMPM(formatTime(breaks[i].finishtime)) + '</h4>';
        }
        
        tr.appendChild(breaktype);
        tr.appendChild(startbreak);
        tr.appendChild(sep);
        tr.appendChild(endbreak);

        breakstable.appendChild(tr);
      }  
  });
}

function loadHelps() {
  var howlist = document.getElementById('howlist');
  howlist.innerHTML = '';

  var request = {};
  
  sendPost("/gethows", JSON.stringify(request), function(response) {
      helps =  JSON.parse(response);
      displayHelps('');
  });
}

function displayHelps(contains) {
  var howlist = document.getElementById('howlist');
  howlist.innerHTML = '';
  
  for(var i = 0; i < helps.length; i++) {
    var name = helps[i].name;
    var id = helps[i].id;
    if (name.toUpperCase().includes(contains.toUpperCase())) {
      var help  = document.createElement('li');
      help.classList.add('list-group-item');
      help.innerHTML = name;
      help.setAttribute('onclick', 'showHelp(' + id + ');');

      howlist.appendChild(help);
    }
  }
}

function showHelp(id) {
  for(var i = 0; i < helps.length; i++) {
    if (id == helps[i].id) {
      alert(helps[i].description);
      break;
    }
  }  
}

function loadTimeOff() {
  var unapproved_title = document.getElementById('unapproved_title');
  var sickdays_title = document.getElementById('sickdays_title');
  var timeoff_title = document.getElementById('timeoff_title');

  var unapproved_table = document.getElementById('unapproved_table');
  var sickdays_table = document.getElementById('sickdays_table');
  var timeoff_table = document.getElementById('timeoff_table');
  unapproved.innerHTML = '';
  sickdays.innerHTML = '';
  timeoff.innerHTML = '';

  unapproved_title.style = "display: none";
  sickdays_title.style = "display: none";
  timeoff_title.style = "display: none";

  var request = {};

  sendPost("/employee_timeoff", JSON.stringify(request), function(response) {
    var allTimeOff =  JSON.parse(response);

    var unapprovedItems = [];
    var sickItems = [];
    var timeoffItems = [];

    for(var i = 0; i < allTimeOff.length; i++) {
      if (allTimeOff[i].approved == 0) {
        unapprovedItems.push(allTimeOff[i]);
      } else if (allTimeOff[i].role.toLowerCase().contains('sick') && allTimeOff[i].approved == 1) {
        sickItems.push(allTimeOff[i]);
      } else if (allTimeOff[i].approved == 1) {
        timeoffItems.push(allTimeOff[i]);
      }
    }

    for(var i = 0; i < unapprovedItems.length; i++) {
        unapproved_title.style = "display: inline";
        addTimeOffRow(unapproved_table, 'lightgray', 'Start', 'white', new Date(unapprovedItems[i].start_date).toDateString());
        addTimeOffRow(unapproved_table, 'lightgray', 'End', 'white', new Date(unapprovedItems[i].end_date).toDateString());
        addTimeOffRow(unapproved_table, 'lightgray', 'Type', 'white', unapprovedItems[i].role);
        addTimeOffRow(unapproved_table, 'lightgray', 'Paid', 'white', unapprovedItems[i].paid);
        addTimeOffRow(unapproved_table, 'lightgray', 'Reason', 'white', unapprovedItems[i].reason);
        addTimeOffEdit(unapproved_table, i);
    }

    for(var i = 0; i < sickItems.length; i++) {
        sickdays_title.style = "display: inline";
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'Start', 'white', new Date(sickItems[i].start_date).toDateString());
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'End', 'white', new Date(sickItems[i].end_date).toDateString());
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'Paid', 'white', sickItems[i].paid);
        addTimeOffRow(unapproved, 'lightgray', 'Reason', 'white', sickItems[i].reason);
        if (i+1 < sickItems.length) {
          addTimeOffSpace(sickdays_table);
        }
    }

    for(var i = 0; i < timeoffItems.length; i++) {
      timeoff_title.style = "display: inline";
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'Start', 'white', new Date(timeoffItems[i].start_date).toDateString());
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'End', 'white', new Date(timeoffItems[i].end_date).toDateString());
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'Paid', 'white', timeoffItems[i].paid);

      if (i+1 < timeoffItems.length) {
        addTimeOffSpace(timeoff_table);
      }
    }
  });
}

function addTimeOffRow(table, labelbackground, labeltext, valuebackground, valuetext) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: ' + labelbackground + ';');
  label.innerText = labeltext;
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: ' + valuebackground + ';');
  value.innerText = valuetext;

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);
}

function addTimeOffSpace(table) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 20px; width: 160px; border-left-style: hidden; border-right-style: hidden;');
  label.innerText = ' ';
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: center; vertical-align: middle; height: 20px; width: 160px; border-left-style: hidden; border-right-style: hidden;');
  value.innerText = ' ';

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);
}

function addTimeOffEdit(table, id) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 160px; border-left-style: hidden; border-right-style: hidden; border-bottom-style: hidden;');
  label.innerText = ' ';
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: right; vertical-align: top; height: 50px; width: 160px; border-left-style: hidden; border-right-style: hidden; border-bottom-style: hidden; padding: 5px');
  value.innerHTML = '<button type="button" onclick="editTimeOff(' + id + ');">Edit</button>';

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);
}

function editTimeOff(id) {
  alert('hello! ' + id);
}

function requestTimeOff() {
  alert('No!');
}