

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.validator = factory());
}(this, (function () { 'use strict'

var isEmail = require('./lib/isEmail')

var validator = {
  isEmail: isEmail

};

return validator;




})));
