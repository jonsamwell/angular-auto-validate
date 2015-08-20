/*
 * Taken from https://github.com/angular/angular.js/issues/2690#issue-14462164 (with added tests of course!)
 */
function JCSDebounceFn($timeout) {
  var debounce = function (fn, timeout, apply) {
    timeout = angular.isUndefined(timeout) ? 0 : timeout;
    apply = angular.isUndefined(apply) ? true : apply; // !!default is true! most suitable to my experience
    var nthCall = 0;
    return function () { // intercepting fn
      var that = this;
      var argz = arguments;
      nthCall += 1;
      var later = (function (version) {
        return function () {
          if (version === nthCall) {
            return fn.apply(that, argz);
          }
        };
      })(nthCall);

      return $timeout(later, timeout, apply);
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
