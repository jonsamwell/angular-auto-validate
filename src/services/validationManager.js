(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('validationManager', [
            'validator',
            function (validator) {
                var
                /**
                 * @ngdoc validateElement
                 * @name validation#validateElement
                 * @param {object} modelCtrl holds the information about the element e.g. $invalid, $valid
                 * @description
                 * Validate the form element and make invalid/valid element model status.
                 */
                    validateElement = function (modelCtrl, el) {
                    var isValid,
                        errorType,
                        needsValidation = (modelCtrl.$parsers.length > 0 || modelCtrl.$formatters.length > 0) && modelCtrl.$pristine === false,
                        findErrorType = function ($errors) {
                            var keepGoing = true,
                                errorTypeToReturn;
                            angular.forEach($errors, function (status, errortype) {
                                if (keepGoing && status) {
                                    keepGoing = false;
                                    errorTypeToReturn = errortype;
                                }
                            });

                            return errorTypeToReturn;
                        };

                    if (modelCtrl && needsValidation) {
                        isValid = !modelCtrl.$invalid;
                        if (isValid) {
                            validator.makeValid(el);
                        } else {
                            errorType = findErrorType(modelCtrl.$error);

                            validator.getErrorMessage(errorType, el).then(function (errorMsg) {
                                validator.makeInvalid(el, errorMsg);
                            });
                        }

                        return isValid;
                    }
                },

                    validateForm = function (frmEl, modelCtrl) {

                    };

                return {
                    validateElement: validateElement,
                    validateForm: validateForm
                };
            }
        ]);
}(angular));
