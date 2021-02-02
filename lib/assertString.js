function assertString(input) {
    var isString = typeof input === 'string' || input instanceof String;
  
    if (!isString) {
      var invalidType = _typeof(input);
  
      if (input === null) invalidType = 'null';else if (invalidType === 'object') invalidType = input.constructor.name;
      throw new TypeError("Expected a string but received a ".concat(invalidType));
    }
  }

  module.exports = assertString