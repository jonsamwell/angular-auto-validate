(function (angular) {
    'use strict';


    angular.module('jcs-autoValidate')
        .factory('jcs-elementUtils', [
            function () {
                var isElementVisible = function (el) {
                    return el[0].offsetWidth > 0 && el[0].offsetHeight > 0;
                };

                return {
                    isElementVisible: isElementVisible
                };
            }
        ]);

    angular.module('jcs-autoValidate')
        .factory('validationManager', [
            'validator',
            'jcs-elementUtils',
            function (validator, elementUtils) {
                var elementTypesToValidate = ['input', 'textarea', 'select', 'form'],

                    elementIsVisible = function (el) {
                        return elementUtils.isElementVisible(el);
                    },

                    /**
                     * Only validate if the element is present, it is visible
                     * it is either a valid user input control (input, select, textare, form) or
                     * it is a custom control register by the developer.
                     * @param el
                     * @returns {boolean} true to indicate it should be validated
                     */
                    shouldValidateElement = function (el) {
                        return el &&
                            el.length > 0 &&
                            elementIsVisible(el) &&
                            (elementTypesToValidate.indexOf(el[0].nodeName.toLowerCase()) > -1 ||
                                el[0].hasAttribute('register-custom-form-control'));
                    },

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

                        if ((forceValidation || (shouldValidateElement(el) && modelCtrl && needsValidation))) {
                            isValid = !modelCtrl.$invalid;

                            if (isValid) {
                                validator.makeValid(el);
                            } else {
                                errorType = findErrorType(modelCtrl.$error);

                                if (errorType === undefined) {
                                    // we have a weird situation some users are encountering where a custom control
                                    // is valid but the ngModel is report it isn't and thus no valid error type can be found
                                    isValid = true;
                                } else {
                                    validator.getErrorMessage(errorType, el).then(function (errorMsg) {
                                        validator.makeInvalid(el, errorMsg);
                                    });
                                }
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
                                if (ctrlElement[0].nodeName.toLowerCase() === 'form') {
                                    // we probably have a sub form
                                    resetForm(ctrlElement);
                                } else {
                                    controller.$setPristine();
                                }
                            }
                        });
                    },

                    validateForm = function (frmElement) {
                        var frmValid = true,
                            frmCtrl = frmElement ? angular.element(frmElement).controller('form') : undefined,
                            processElement = function (ctrlElement, force) {
                                var controller, isValid;
                                ctrlElement = angular.element(ctrlElement);
                                controller = ctrlElement.controller('ngModel');

                                if (controller !== undefined && (force || shouldValidateElement(ctrlElement))) {
                                    if (ctrlElement[0].nodeName.toLowerCase() === 'form') {
                                        // we probably have a sub form
                                        validateForm(ctrlElement);
                                    } else {
                                        isValid = validateElement(controller, ctrlElement, true);
                                        frmValid = frmValid && isValid;
                                    }
                                }
                            };

                        if (frmElement === undefined || (frmCtrl !== undefined && frmCtrl.disableDynamicValidation)) {
                            return frmElement !== undefined;
                        }

                        // IE8 holds the child controls collection in the all property
                        // Firefox in the elements and chrome as a child iterator
                        angular.forEach((frmElement[0].all || frmElement[0].elements) || frmElement[0], function (ctrlElement) {
                            processElement(ctrlElement);
                        });

                        // If you have a custom form control that should be validated i.e.
                        // <my-custom-element>...</my-custom-element> it will not be part of the forms
                        // HTMLFormControlsCollection and thus won't be included in the above element iteration although
                        // it will be on the Angular FormController (if it has a name attribute).  So adding the directive
                        // register-custom-form-control="" to the control root and autoValidate will include it in this
                        // iteration.
                        if (frmElement[0].customHTMLFormControlsCollection) {
                            angular.forEach(frmElement[0].customHTMLFormControlsCollection, function (ctrlElement) {
                                // need to force the validation as the element might not be a known form input type
                                // so the normal validation process will ignore it.
                                processElement(ctrlElement, true);
                            });
                        }

                        return frmValid;
                    },

                    setElementValidationError = function (element, errorMsgKey, errorMsg) {
                        if (errorMsgKey) {
                            validator.getErrorMessage(errorMsgKey, element).then(function (msg) {
                                validator.makeInvalid(element, msg);
                            });
                        } else {
                            validator.makeInvalid(element, errorMsg);
                        }
                    };

                return {
                    setElementValidationError: setElementValidationError,
                    validateElement: validateElement,
                    validateForm: validateForm,
                    resetElement: resetElement,
                    resetForm: resetForm
                };
            }
        ]);
}(angular));
