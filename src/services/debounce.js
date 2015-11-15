/*
 * Taken from https://github.com/angular/angular.js/issues/2690#issue-14462164 (with added tests of course!)
 */
function JCSDebounceFn($timeout) {
  var debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };

      var callNow = immediate && !timeout;
      $timeout.cancel(timeout);
      timeout = $timeout(later, wait, false);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  return {
    debounce: debounce
  };
}

JCSDebounceFn.$inject = [
  '$timeout'
];

angular.module('jcs-autoValidate').factory('jcs-debounce', JCSDebounceFn);
