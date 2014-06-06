(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').factory('debounce', [

        function () {
            return {
                debounce: _.debounce
            };
        }
    ]);
}(angular));
