/*
 * angular-auto-validate - v1.0.15 - 2014-08-02
 * https://github.com/jonsamwell/angular-auto-validate
 * Copyright (c) 2014 Jon Samwell;*/
(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate', []);
}(angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .provider('validator', [

            function () {
                var elementStateModifiers = {},
                    enableValidElementStyling = true,
                    enableInvalidElementStyling = true;

                /**
                 * @ngdoc function
                 * @name validator#setDefaultElementModifier
                 * @methodOf validator
                 *
                 * @description
                 * Sets the default element modifier that will be used by the validator
                 * to change an elements UI state.  Please ensure the modifier has been registered
                 * before setting it as default.
                 *
                 * Note: this can be changed by setting the
                 * element modifier attribute on the input element 'data-element-modifier="myCustomModifier"'
                 *
                 * Example:
                 * <pre>
                 *  app.config(function (validator) {
                 *    validator.setDefaultElementModifier('myCustomModifier');
                 *  });
                 * </pre>
                 *
                 * @param {string} key The key name of the modifier.
                 */
                this.setDefaultElementModifier = function (key) {
                    if (elementStateModifiers[key] === undefined) {
                        throw new Error('Element modifier not registered: ' + key);
                    }

                    this.defaultElementModifier = key;
                };

                /**
                 * @ngdoc function
                 * @name validator#registerDomModifier
                 * @methodOf validator
                 *
                 * @description
                 * Registers an object that adheres to the elementModifier interface and is
                 * able to modifier an elements dom so that appears valid / invalid for a specific
                 * scenario i.e. the Twitter Bootstrap css framework, Foundation CSS framework etc.
                 *
                 * Example:
                 * <pre>
                 *  app.config(function (validator) {
                 *    validator.registerDomModifier('customDomModifier', {
                 *      makeValid: function (el) {
                 *          el.removeClass(el, 'invalid');
                 *          el.addClass(el, 'valid');
                 *      },
                 *      makeInvalid: function (el, err, domManipulator) {
                 *          el.removeClass(el, 'valid');
                 *          el.addClass(el, 'invalid');
                 *      }
                 *    });
                 *  });
                 * </pre>
                 *
                 * @param {string} key The key name of the modifier
                 * @param {object} modifier An object which implements the elementModifier interface
                 */
                this.registerDomModifier = function (key, modifier) {
                    elementStateModifiers[key] = modifier;
                };

                /**
                 * @ngdoc function
                 * @name validator#setErrorMessageResolver
                 * @methodOf validator
                 *
                 * @description
                 * Registers an object that adheres to the elementModifier interface and is
                 * able to modifier an elements dom so that appears valid / invalid for a specific
                 * scenario i.e. the Twitter Bootstrap css framework, Foundation CSS framework etc.
                 *
                 * Example:
                 * <pre>
                 *  app.config(function (validator) {
                 *    validator.setErrorMessageResolver(function (errorKey, el) {
                 *      var defer = $q.defer();
                 *      // resolve the correct error from the given key and resolve the returned promise.
                 *      return defer.promise();
                 *    });
                 *  });
                 * </pre>
                 *
                 * @param {function} resolver A method that returns a promise with the resolved error message in.
                 */
                this.setErrorMessageResolver = function (resolver) {
                    this.errorMessageResolver = resolver;
                };

                /**
                 * @ngdoc function
                 * @name validator#getErrorMessage
                 * @methodOf validator
                 *
                 * @description
                 * Resolves the error message for the given error type.
                 *
                 * @param {String} errorKey The error type.
                 * @param {Element} el The UI element that is the focus of the error.
                 * It is provided as the error message may need information from the element i.e. ng-min (the min allowed value).
                 */
                this.getErrorMessage = function (errorKey, el) {
                    if (this.errorMessageResolver === undefined) {
                        throw new Error('Please set an error message resolver via the setErrorMessageResolver function before attempting to resolve an error message.');
                    }

                    return this.errorMessageResolver(errorKey, el);
                };

                /**
                 * @ngdoc function
                 * @name validator#setValidElementStyling
                 * @methodOf validator
                 *
                 * @description
                 * Globally enables valid element visual styling.  This is enabled by default.
                 *
                 * @param {Boolean} enabled True to enable style otherwise false.
                 */
                this.setValidElementStyling = function (enabled) {
                    enableValidElementStyling = enabled;
                };


                /**
                 * @ngdoc function
                 * @name validator#setInvalidElementStyling
                 * @methodOf validator
                 *
                 * @description
                 * Globally enables invalid element visual styling.  This is enabled by default.
                 *
                 * @param {Boolean} enabled True to enable style otherwise false.
                 */
                this.setInvalidElementStyling = function (enabled) {
                    enableInvalidElementStyling = enabled;
                };

                this.getDomModifier = function (el) {
                    var modifierKey = (el !== undefined ? el.attr('element-modifier') : this.defaultElementModifier) ||
                        (el !== undefined ? el.attr('data-element-modifier') : this.defaultElementModifier) ||
                        this.defaultElementModifier;

                    if (modifierKey === undefined) {
                        throw new Error('Please set a default dom modifier via the setDefaultElementModifier method on the validator class.');
                    }

                    return elementStateModifiers[modifierKey];
                };

                this.makeValid = function (el) {
                    if (enableValidElementStyling === true) {
                        this.getDomModifier(el).makeValid(el);
                    }
                };

                this.makeInvalid = function (el, errorMsg) {
                    if (enableInvalidElementStyling === true) {
                        this.getDomModifier(el).makeInvalid(el, errorMsg);
                    }
                };

                this.makeDefault = function (el) {
                    var dm = this.getDomModifier(el);
                    if (dm.makeDefault) {
                        dm.makeDefault(el);
                    }
                };

                this.$get = [

                    function () {
                        return this;
                    }
                ];
            }
        ]);
}(angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('bootstrap3ElementModifier', [

            function () {
                var reset = function (el) {
                        angular.forEach(el.find('span'), function (spanEl) {
                            spanEl = angular.element(spanEl);
                            if (spanEl.hasClass('error-msg') || spanEl.hasClass('form-control-feedback')) {
                                spanEl.remove();
                            }
                        });

                        el.removeClass('has-success has-error has-feedback');
                    },
                    findFormGroupElement = function (el) {
                        var parent = el;
                        for (var i = 0; i <= 3; i += 1) {
                            if (parent !== undefined && parent.hasClass('form-group')) {
                                break;
                            } else if (parent !== undefined) {
                                parent = parent.parent();
                            }
                        }

                        return parent;
                    },

                    insertAfter = function (referenceNode, newNode) {
                        referenceNode[0].parentNode.insertBefore(newNode[0], referenceNode[0].nextSibling);
                    },

                    /**
                     * @ngdoc property
                     * @name bootstrap3ElementModifier#addValidationStateIcons
                     * @propertyOf bootstrap3ElementModifier
                     * @returns {bool} True if an state icon will be added to the element in the valid and invalid control
                     * states.  The default is false.
                     */
                    addValidationStateIcons = false,

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#enableValidationStateIcons
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply an icon to the input element.
                     *
                     * @param {bool} enable - True to enable the icon otherwise false.
                     */
                    enableValidationStateIcons = function (enable) {
                        addValidationStateIcons = enable;
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeValid
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear valid by apply bootstrap 3 specific styles and child elements. If the service
                     * property 'addValidationStateIcons' is true it will also append validation glyphicon to the element.
                     * See: http://getbootstrap.com/css/#forms-control-validation
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeValid = function (el) {
                        var frmGroupEl = findFormGroupElement(el);
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-success has-feedback');
                        if (addValidationStateIcons) {
                            insertAfter(el, angular.element('<span class="glyphicon glyphicon-ok form-control-feedback"></span>'));
                        }
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeInvalid
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply bootstrap 3 specific styles and child elements. If the service
                     * property 'addValidationStateIcons' is true it will also append validation glyphicon to the element.
                     * See: http://getbootstrap.com/css/#forms-control-validation
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeInvalid = function (el, errorMsg) {
                        var frmGroupEl = findFormGroupElement(el),
                            helpTextEl = angular.element('<span class="help-block has-error error-msg">' + errorMsg + '</span>');
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-error has-feedback');
                        insertAfter(el, helpTextEl);
                        if (addValidationStateIcons) {
                            insertAfter(el, angular.element('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'));
                        }
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeDefault
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear in its default visual state by apply bootstrap 3 specific styles and child elements.
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeDefault = function (el) {
                        var frmGroupEl = findFormGroupElement(el);
                        reset(frmGroupEl);
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    makeDefault: makeDefault,
                    enableValidationStateIcons: enableValidationStateIcons,
                    key: 'bs3'
                };
            }
        ]);
}(angular));

(function (angular) {
    'use strict';

    /*
     * Taken from https://github.com/angular/angular.js/issues/2690#issue-14462164 (with added tests of course!)
     */
    angular.module('jcs-autoValidate').factory('debounce', [
        '$timeout',
        function ($timeout) {
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
    ]);
}(angular));

(function (String, angular) {
    'use strict';

    /**
     * Replaces string placeholders with corresponding template string
     */
    if (!('format' in String.prototype)) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== undefined ? args[number] : match;
            });
        };
    }

    angular.autoValidate = angular.autoValidate || {
        errorMessages: {}
    };

    angular.autoValidate.errorMessages['en-us'] = angular.autoValidate.errorMessages['en-gb'] = {
        defaultMsg: 'Please add error message for {0}',
        email: 'Please enter a valid email address',
        minlength: 'Please enter at least {0} characters',
        maxlength: 'You have entered more than the maximum {0} characters',
        min: 'Please enter the minimum number of {0}',
        max: 'Please enter the maximum number of {0}',
        required: 'This field is required',
        date: 'Please enter a valid date',
        pattern: 'Please ensure the entered information adheres to this pattern {0}',
        number: 'Please enter a valid number',
        url: 'Please enter a valid URL in the format of http(s)://wwww.google.com'
    };

    angular.module('jcs-autoValidate')
        .factory('defaultErrorMessageResolver', [
            '$q',
            '$http',
            function ($q, $http) {
                var currentCulture = 'en-gb',

                    i18nFileRootPath = 'js/angular-auto-validate/dist/lang',

                    cultureRetrievalPromise,

                    loadRemoteCulture = function (culture) {
                        cultureRetrievalPromise = $http.get('{0}/jcs-auto-validate_{1}.json'.format(i18nFileRootPath, culture.toLowerCase()));
                        return cultureRetrievalPromise;
                    },

                    /**
                     * @ngdoc function
                     * @name defaultErrorMessageResolver#setI18nFileRootPath
                     * @methodOf defaultErrorMessageResolver
                     *
                     * @description
                     * Set the root path to the il8n files on the server
                     *
                     * @param {String} rootPath - The root path on the server to the il8n file - this defaults
                     * to 'js/angular-auto-validate/lang/'
                     */
                    setI18nFileRootPath = function (rootPath) {
                        i18nFileRootPath = rootPath;
                    },

                    /**
                     * @ngdoc function
                     * @name defaultErrorMessageResolver#setCulture
                     * @methodOf defaultErrorMessageResolver
                     *
                     * @description
                     * Set the culture for the error messages by loading an the correct culture resource file.
                     *
                     * @param {String} culture - The new culture in the format of 'en-gb' etc.
                     * @param {Function} cultureLoadingFn - A optional function to load the culture resolve which should
                     * return a promise which is resolved with the culture errorMessage object.  If a function is not specified
                     * the culture file is loaded from the **i18nFileRootPath**.
                     * @returns {Promise} - A promise which is resolved with the loaded culture error messages object.
                     */
                    setCulture = function (culture, cultureLoadingFn) {
                        var defer = $q.defer();
                        cultureLoadingFn = cultureLoadingFn || loadRemoteCulture;
                        currentCulture = culture.toLowerCase();
                        if (angular.autoValidate.errorMessages[currentCulture] === undefined) {
                            cultureRetrievalPromise = cultureLoadingFn(culture);
                            cultureRetrievalPromise.then(function (response) {
                                cultureRetrievalPromise = undefined;
                                angular.autoValidate.errorMessages[currentCulture] = response.data;
                                defer.resolve(angular.autoValidate.errorMessages[currentCulture]);
                            }, function (err) {
                                angular.autoValidate.errorMessages[currentCulture] = {
                                    defaultMsg: 'Loading culture failed!'
                                };
                                cultureRetrievalPromise = null;
                                defer.reject(err);
                            });
                        } else {
                            defer.resolve(angular.autoValidate.errorMessages[currentCulture]);
                        }

                        return defer.promise;
                    },

                    getErrorMessages = function (culture) {
                        var defer = $q.defer();
                        culture = culture === undefined ? currentCulture : culture.toLowerCase();
                        if (cultureRetrievalPromise !== undefined) {
                            cultureRetrievalPromise.then(function () {
                                defer.resolve(angular.autoValidate.errorMessages[culture]);
                            }, function (err) {
                                defer.reject(err);
                            });
                        } else {
                            defer.resolve(angular.autoValidate.errorMessages[culture]);
                        }
                        return defer.promise;
                    },

                    /**
                     * @ngdoc function
                     * @name defaultErrorMessageResolver#resolve
                     * @methodOf defaultErrorMessageResolver
                     *
                     * @description
                     * Resolves a validate error type into a user validation error message
                     *
                     * @param {String} errorType - The type of validation error that has occurred.
                     * @param {Element} el - The input element that is the source of the validation error.
                     * @returns {Promise} A promise that is resolved when the validation message has been produced.
                     */
                    resolve = function (errorType, el) {
                        var defer = $q.defer(),
                            errMsg,
                            parameters = [],
                            parameter;

                        if (cultureRetrievalPromise !== undefined) {
                            cultureRetrievalPromise.then(function () {
                                resolve(errorType, el).then(function (msg) {
                                    defer.resolve(msg);
                                });
                            });
                        } else {
                            errMsg = angular.autoValidate.errorMessages[currentCulture][errorType];
                            if (errMsg === undefined) {
                                errMsg = angular.autoValidate.errorMessages[currentCulture].defaultMsg.format(errorType);
                            }

                            if (el && el.attr) {
                                try {
                                    parameter = el.attr(errorType);
                                    if (parameter === undefined) {
                                        parameter = el.attr('data-ng-' + errorType) || el.attr('ng-' + errorType);
                                    }

                                    parameters.push(parameter || '');

                                    errMsg = errMsg.format(parameters);
                                } catch (e) {}
                            }

                            defer.resolve(errMsg);
                        }

                        return defer.promise;
                    };

                return {
                    setI18nFileRootPath: setI18nFileRootPath,
                    setCulture: setCulture,
                    getErrorMessages: getErrorMessages,
                    resolve: resolve
                };
            }
        ]);
}(String, angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('foundation5ElementModifier', [

            function () {
                var reset = function (el, inputEl) {
                        angular.forEach(el.find('small'), function (smallEl) {
                            if (angular.element(smallEl).hasClass('error')) {
                                angular.element(smallEl).remove();
                            }
                        });

                        inputEl.removeClass('error');
                    },
                    findParentColumn = function (el) {
                        var parent = el;
                        for (var i = 0; i <= 3; i += 1) {
                            if (parent !== undefined && parent.hasClass('columns')) {
                                break;
                            } else if (parent !== undefined) {
                                parent = parent.parent();
                            }
                        }

                        return parent;
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeValid
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear valid by apply Foundation 5 specific styles and child elements.
                     * See: http://foundation.zurb.com/docs/components/forms.html
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeValid = function (el) {
                        var parentColumn = findParentColumn(el);
                        reset(parentColumn && parentColumn.length > 0 ? parentColumn : el, el);
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeInvalid
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply Foundation 5 specific styles and child elements.
                     * See: http://foundation.zurb.com/docs/components/forms.html
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeInvalid = function (el, errorMsg) {
                        var parentColumn = findParentColumn(el),
                            helpTextEl;
                        reset(parentColumn || el, el);
                        el.addClass('error');
                        if (parentColumn) {
                            helpTextEl = angular.element('<small class="error">' + errorMsg + '</small>');
                            parentColumn.append(helpTextEl);
                        }
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeDefault
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear in its default visual state by apply foundation 5 specific styles and child elements.
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeDefault = function (el) {
                        makeValid(el);
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    makeDefault: makeDefault,
                    key: 'foundation5'
                };
            }
        ]);
}(angular));

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

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('form', [
        'validationManager',
        function (validationManager) {
            return {
                restrict: 'E',
                link: function (scope, el) {
                    el.on('reset', function () {
                        validationManager.resetForm(el);
                    });

                    scope.$on('$destroy', function () {
                        el.off('reset');
                    });
                }
            };
        }
    ]);
}(angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngSubmitDirective', [
                '$delegate',
                '$parse',
                'validationManager',
                function ($delegate, $parse, validationManager) {
                    $delegate[0].compile = function ($element, attr) {
                        var fn = $parse(attr.ngSubmit),
                            force = attr.ngSubmitForce === 'true';
                        return function (scope, element) {
                            element.on('submit', function (event) {
                                scope.$apply(function () {
                                    if (force === true || validationManager.validateForm(element)) {
                                        fn(scope, {
                                            $event: event
                                        });
                                    }
                                });
                            });
                        };
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
}(angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngModelDirective', [
                '$delegate',
                'validationManager',
                'debounce',
                function ($delegate, validationManager, debounce) {
                    var directive = $delegate[0],
                        link = directive.link;

                    directive.compile = function () {
                        return function (scope, element, attrs, ctrls) {
                            var ngModelCtrl = ctrls[0],
                                supportsNgModelOptions = angular.version.major >= 1 && angular.version.minor >= 3,
                                ngModelOptions = attrs.ngModelOptions === undefined ? undefined : scope.$eval(attrs.ngModelOptions),
                                setValidity = ngModelCtrl.$setValidity,
                                setPristine = ngModelCtrl.$setPristine,
                                setValidationState = debounce.debounce(function () {
                                    validationManager.validateElement(ngModelCtrl, element);
                                }, 100);


                            if (link.pre) {
                                link.pre.apply(this, arguments);
                                ngModelOptions = ngModelCtrl.$options === undefined ? undefined : ngModelCtrl.$options;
                            }

                            if (attrs.formnovalidate === undefined) {
                                if (supportsNgModelOptions || ngModelOptions === undefined || ngModelOptions.updateOn === undefined || ngModelOptions.updateOn === '') {
                                    ngModelCtrl.$setValidity = function (validationErrorKey, isValid) {
                                        setValidity.call(ngModelCtrl, validationErrorKey, isValid);
                                        setValidationState();
                                    };
                                } else {
                                    element.on(ngModelOptions.updateOn, function () {
                                        setValidationState();
                                    });

                                    scope.$on('$destroy', function () {
                                        element.off(ngModelOptions.updateOn);
                                    });
                                }

                                // We override this so
                                ngModelCtrl.$setPristine = function () {
                                    setPristine.call(ngModelCtrl);
                                    validationManager.resetElement(element);
                                };

                                ngModelCtrl.autoValidated = true;
                            }

                            if (link.post) {
                                link.post.apply(this, arguments);
                            } else {
                                link.apply(this, arguments);
                            }
                        };
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
}(angular));

(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .run([
            'validator',
            'defaultErrorMessageResolver',
            'bootstrap3ElementModifier',
            'foundation5ElementModifier',
            function (validator, defaultErrorMessageResolver, bootstrap3ElementModifier, foundation5ElementModifier) {
                validator.setErrorMessageResolver(defaultErrorMessageResolver.resolve);
                validator.registerDomModifier(bootstrap3ElementModifier.key, bootstrap3ElementModifier);
                validator.registerDomModifier(foundation5ElementModifier.key, foundation5ElementModifier);
                validator.setDefaultElementModifier(bootstrap3ElementModifier.key);
            }
        ]);
}(angular));
