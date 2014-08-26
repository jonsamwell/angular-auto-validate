(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('disableDynamicValidation', [

        function () {
            return {
                restrict: 'A',
                require: 'form',
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ctrl) {
                            ctrl.disableDynamicValidation = true;
                        }
                    };
                }
            };
        }
    ]);
}(angular));
