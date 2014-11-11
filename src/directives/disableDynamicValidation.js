(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('form', [
        'validator',
        function (validator) {
            return {
                restrict: 'E',
                require: 'form',
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ctrl) {
                            ctrl.disableDynamicValidation = !validator.isEnabled();
                            if (attrs.disableDynamicValidation !== undefined) {
                                ctrl.disableDynamicValidation = attrs.disableDynamicValidation === undefined || attrs.disableDynamicValidation === '' || attrs.disableDynamicValidation === 'true';
                            }
                        }
                    };
                }
            };
        }
    ]);
}(angular));
