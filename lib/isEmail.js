
const assertString = require('./assertString')
const merge = require('./merge')

const validateDisplayName = require('./validateDisplayName')

const isByteLength = require('./isByteLength')

const isFQDN = require('./isFQDN')

  
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

 
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  
 
  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
  
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
  
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
  
    return _arr;
  }
  
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
  
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  
    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }


var default_email_options = {
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
    blacklisted_chars: '',
    ignore_max_length: false
  };


var splitNameAddress = /^([^\x00-\x1F\x7F-\x9F\cX]+)<(.+)>$/i;
var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
var gmailUserPart = /^[a-z\d]+$/;
var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
var defaultMaxEmailLength = 254;

const isEmail = (str, options)=> {
    assertString(str);
    options = merge(options, default_email_options);
  
    if (options.require_display_name || options.allow_display_name) {
      var display_email = str.match(splitNameAddress);
  
      if (display_email) {
        var display_name;
  
        var _display_email = _slicedToArray(display_email, 3);
  
        display_name = _display_email[1];
        str = _display_email[2];
  
        // sometimes need to trim the last space to get the display name
        // because there may be a space between display name and email address
        // eg. myname <address@gmail.com>
        // the display name is `myname` instead of `myname `, so need to trim the last space
        if (display_name.endsWith(' ')) {
          display_name = display_name.substr(0, display_name.length - 1);
        }
  
        if (!validateDisplayName(display_name)) {
          return false;
        }
      } else if (options.require_display_name) {
        return false;
      }
    }
  
    if (!options.ignore_max_length && str.length > defaultMaxEmailLength) {
      return false;
    }
  
    var parts = str.split('@');
    var domain = parts.pop();
    var user = parts.join('@');
    var lower_domain = domain.toLowerCase();
  
    if (options.domain_specific_validation && (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com')) {
      /*
        Previously we removed dots for gmail addresses before validating.
        This was removed because it allows `multiple..dots@gmail.com`
        to be reported as valid, but it is not.
        Gmail only normalizes single dots, removing them from here is pointless,
        should be done in normalizeEmail
      */
      user = user.toLowerCase(); // Removing sub-address from username before gmail validation
  
      var username = user.split('+')[0]; // Dots are not included in gmail length restriction
  
      if (!isByteLength(username.replace('.', ''), {
        min: 6,
        max: 30
      })) {
        return false;
      }
  
      var _user_parts = username.split('.');
  
      for (var i = 0; i < _user_parts.length; i++) {
        if (!gmailUserPart.test(_user_parts[i])) {
          return false;
        }
      }
    }
  
    if (options.ignore_max_length === false && (!isByteLength(user, {
      max: 64
    }) || !isByteLength(domain, {
      max: 254
    }))) {
      return false;
    }
  
    if (!isFQDN(domain, {
      require_tld: options.require_tld
    })) {
      if (!options.allow_ip_domain) {
        return false;
      }
  
      if (!isIP(domain)) {
        if (!domain.startsWith('[') || !domain.endsWith(']')) {
          return false;
        }
  
        var noBracketdomain = domain.substr(1, domain.length - 2);
  
        if (noBracketdomain.length === 0 || !isIP(noBracketdomain)) {
          return false;
        }
      }
    }
  
    if (user[0] === '"') {
      user = user.slice(1, user.length - 1);
      return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
    }
  
    var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;
    var user_parts = user.split('.');
  
    for (var _i = 0; _i < user_parts.length; _i++) {
      if (!pattern.test(user_parts[_i])) {
        return false;
      }
    }
  
    if (options.blacklisted_chars) {
      if (user.search(new RegExp("[".concat(options.blacklisted_chars, "]+"), 'g')) !== -1) return false;
    }
  
    return true;
}

module.exports = isEmail;