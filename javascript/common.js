function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function pad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function formatDate(d) {
  if (d) {
    return pad(d.getFullYear()) + '-' + pad(d.getMonth()) + '-' + pad(d.getDate());
  } else {
    return '-';
  }
}

function getDate() {
  var d = new Date();
  return formatDate(d);
}

function formatTime(d) {
  if (d) {
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  } else {
    return '-';
  }
}

function getTime() {
  var d = new Date();
  return formatTime(d);
}
  
function sendPost(url, data, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(data);

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.response);
    }
  };
}