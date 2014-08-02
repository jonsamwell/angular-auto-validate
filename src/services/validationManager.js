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
                 * @param {Boolean} forceValidation if set to true forces the validation even if the element is pristine
                 * @description
                 * Validate the form element and make invalid/valid element model status.
                 */
                    validateElement = function (modelCtrl, el, forceValidation) {
                        var isValid = true,
                            needsValidation = modelCtrl.$pristine === false || forceValidation,
                            errorType,
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
                        }

                        return isValid;
                    },

                    resetElement = function (element) {
                        validator.makeDefault(element);
                    },

                    resetForm = function (frmElement) {
                        angular.forEach(frmElement[0], function (element) {
                            var controller,
                                ctrlElement = angular.element(element);
                            controller = ctrlElement.controller('ngModel');

                            if (controller !== undefined) {
                                if (ctrlElement[0].nodeName === 'FORM') {
                                    // we probably have a sub form
                                    resetForm(ctrlElement);
                                } else {
                                    controller.$setPristine();
                                }
                            }
                        });
                    },

                    validateForm = function (frmElement) {
                        var frmValid = true;
                        if (frmElement === undefined) {
                            return false;
                        }

                        angular.forEach(frmElement[0], function (ctrlElement) {
                            var controller, isValid;
                            ctrlElement = angular.element(ctrlElement);
                            controller = ctrlElement.controller('ngModel');

                            if (controller !== undefined) {
                                if (ctrlElement[0].nodeName === 'FORM') {
                                    // we probably have a sub form
                                    validateForm(ctrlElement);
                                } else {
                                    isValid = validateElement(controller, ctrlElement, true);
                                    frmValid = frmValid && isValid;
                                }
                            }
                        });

                        return frmValid;
                    };

                return {
                    validateElement: validateElement,
                    validateForm: validateForm,
                    resetElement: resetElement,
                    resetForm: resetForm
                };
            }
        ]);
}(angular));
