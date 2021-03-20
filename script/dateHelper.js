function isString(s) {
    return Object.prototype.toString.call(s) === "[object String]"
}
module.exports.isString = isString;

function pad(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  module.exports.pad = pad;
  
  function formatDate(d) {
    if (d) {
      if (isString(d)) {
        d = new Date(d);
      }
  
      return pad(d.getFullYear()) + '-' + pad(d.getMonth()) + '-' + pad(d.getDate());
    } else {
      return '-';
    }
  }
  module.exports.formatDate = formatDate;
  
function getDbFormat() {
  var d = new Date();

  return pad(d.getFullYear()) + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
module.exports.getDate = getDbFormat;


  function getDate() {
    var d = new Date();
    return formatDate(d);
  }
  module.exports.getDate = getDate;
  
  function formatTime(d) {
    if (d) {
      if (isString(d)) {
        d = new Date(d);
      }
      return pad(d.getHours()) + ':' + pad(d.getMinutes());
    } else {
      return '-';
    }
  }
  module.exports.formatTime = formatTime;
  
  function getTime() {
    var d = new Date();
    return formatTime(d);
  }
  module.exports.getTime = getTime;