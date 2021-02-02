function validateDisplayName(display_name) {
    var trim_quotes = display_name.match(/^"(.+)"$/i);
    var display_name_without_quotes = trim_quotes ? trim_quotes[1] : display_name; // display name with only spaces is not valid
  
    if (!display_name_without_quotes.trim()) {
      return false;
    } // check whether display name contains illegal character
  
  
    var contains_illegal = /[\.";<>]/.test(display_name_without_quotes);
  
    if (contains_illegal) {
      // if contains illegal characters,
      // must to be enclosed in double-quotes, otherwise it's not a valid display name
      if (!trim_quotes) {
        return false;
      } // the quotes in display name must start with character symbol \
  
  
      var all_start_with_back_slash = display_name_without_quotes.split('"').length === display_name_without_quotes.split('\\"').length;
  
      if (!all_start_with_back_slash) {
        return false;
      }
    }
  
    return true;
  }

  module.exports = validateDisplayName