(function (angular) {
    'use strict';

    function parseBooleanAttributeValue(val) {
        return val !== undefined && val !== 'false';
    }

    function parseOptions(ctrl, validator, attrs) {
        var opts = ctrl.autoValidateFormOptions = ctrl.autoValidateFormOptions || validator.defaultFormValidationOptions;
        opts.forceValidation = false;
        opts.disabled = !validator.isEnabled() || parseBooleanAttributeValue(attrs.disableDynamicValidation);
        opts.validateNonVisibleControls = parseBooleanAttributeValue(attrs.validateNonVisibleControls);
    }

    angular.module('jcs-autoValidate').directive('form', [
        'validator',
        function (validator) {
            return {
                restrict: 'E',
                require: 'form',
                priority: 9999,
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ctrl) {
                            parseOptions(ctrl, validator, attrs);
                        }
                    };
                }
            };
        }
    ]);

    angular.module('jcs-autoValidate').directive('ngForm', [
        'validator',
        function (validator) {
            return {
                restrict: 'E',
                require: 'form',
                priority: 9999,
                compile: function () {
                    return {
                        pre: function (scope, element, attrs, ctrl) {
                            parseOptions(ctrl, validator, attrs);
                        }
                    };
                }
            };
        }
    ]);
}(angular));
