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

                    getFormOptions = function (el) {
                        var frmCtrl = angular.element(el).controller('form');
                        return frmCtrl !== undefined && frmCtrl !== null ? frmCtrl.autoValidateFormOptions : validator.defaultFormValidationOptions;
                    },

                    /**
                     * Only validate if the element is present, it is visible
                     * it is either a valid user input control (input, select, textare, form) or
                     * it is a custom control register by the developer.
                     * @param el
                     * @param formOptions The validation options of the parent form
                     * @returns {boolean} true to indicate it should be validated
                     */
                    shouldValidateElement = function (el, formOptions) {
                        var result = el &&
                            el.length > 0 &&
                            (elementIsVisible(el) || formOptions.validateNonVisibleControls) &&
                            (elementTypesToValidate.indexOf(el[0].nodeName.toLowerCase()) > -1 ||
                                el[0].hasAttribute('register-custom-form-control'));
                        return result;
                    },

                    /**
                     * @ngdoc validateElement
                     * @name validation#validateElement
                     * @param {object} modelCtrl holds the information about the element e.g. $invalid, $valid
                     * @param {options}
                     *  - forceValidation if set to true forces the validation even if the element is pristine
                     *  - disabled if set to true forces the validation is disabled and will return true
                     *  - validateNonVisibleControls if set to true forces the validation of non visible element i.e. display:block
                     * @description
                     * Validate the form element and make invalid/valid element model status.
                     *
                     * As of v1.17.22:
                     * BREAKING CHANGE to validateElement on the validationManger.  The third parameter is now the parent form's
                     * autoValidateFormOptions object on the form controller.  This can be left blank and will be found by the
                     * validationManager.
                     */
                    validateElement = function (modelCtrl, el, options) {
                        var isValid = true,
                            frmOptions = options || getFormOptions(el),
                            needsValidation = modelCtrl.$pristine === false || frmOptions.forceValidation,
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

                        if (frmOptions.disabled === false) {
                            if ((frmOptions.forceValidation || (shouldValidateElement(el, frmOptions) && modelCtrl && needsValidation))) {
                                isValid = !modelCtrl.$invalid;

                                if (frmOptions.removeExternalValidationErrorsOnSubmit && modelCtrl.removeAllExternalValidation) {
                                    modelCtrl.removeAllExternalValidation();
                                }

                                if (isValid) {
                                    validator.makeValid(el);
                                } else {
                                    errorType = findErrorType(modelCtrl.$errors || modelCtrl.$error);
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
                        }

                        return isValid;
                    },

                    resetElement = function (element) {
                        validator.makeDefault(element);
                    },

                    resetForm = function (frmElement) {
                        angular.forEach((frmElement[0].all || frmElement[0].elements) || frmElement[0], function (element) {
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
                            processElement = function (ctrlElement, force, formOptions) {
                                var controller, isValid, ctrlFormOptions;

                                ctrlElement = angular.element(ctrlElement);
                                controller = ctrlElement.controller('ngModel');

                                if (controller !== undefined && (force || shouldValidateElement(ctrlElement, formOptions))) {
                                    if (ctrlElement[0].nodeName.toLowerCase() === 'form') {
                                        // we probably have a sub form
                                        validateForm(ctrlElement);
                                    } else {
                                        // we need to get the options for the element rather than use the passed in as the
                                        // element could be an ng-form and have different options to the parent form.
                                        ctrlFormOptions = getFormOptions(ctrlElement);
                                        ctrlFormOptions.forceValidation = force;
                                        isValid = validateElement(controller, ctrlElement, ctrlFormOptions);
                                        frmValid = frmValid && isValid;
                                    }
                                }
                            },
                            clonedOptions;

                        if (frmElement === undefined || (frmCtrl !== undefined && frmCtrl.autoValidateFormOptions.disabled)) {
                            return frmElement !== undefined;
                        }

                        //force the validation of controls
                        clonedOptions = angular.copy(frmCtrl.autoValidateFormOptions);
                        clonedOptions.forceValidation = true;

                        // IE8 holds the child controls collection in the all property
                        // Firefox in the elements and chrome as a child iterator
                        angular.forEach((frmElement[0].all || frmElement[0].elements) || frmElement[0], function (ctrlElement) {
                            processElement(ctrlElement, true, clonedOptions);
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
                                processElement(ctrlElement, true, clonedOptions);
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
