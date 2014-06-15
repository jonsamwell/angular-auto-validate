(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate', []);
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
                                setValidationState = debounce.debounce(function () {
                                    validationManager.validateElement(ngModelCtrl, element);
                                }, 100);

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

                                ngModelCtrl.autoValidated = true;
                            }

                            link.apply(this, arguments);
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
        .provider('validator', [

            function () {
                var elementStateModifiers = {};

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
                    this.getDomModifier(el).makeValid(el);
                };

                this.makeInvalid = function (el, errorMsg) {
                    this.getDomModifier(el).makeInvalid(el, errorMsg);
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
                        el.find('.help-text').remove();
                        el.removeClass('has-success has-error has-feedback');

                        if (addValidationStateIcons) {
                            el.find('.form-control-feedback').remove();
                        }
                    },
                    findFormGroupElement = function (el) {
                        return el.closest('.form-group');
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
                            el.append(angular.element('<span class="glyphicon glyphicon-ok form-control-feedback"></span>'));
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
                            helpTextEl = angular.element('<span class="help-text has-error">' + errorMsg + '</span>');
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-error has-feedback');
                        frmGroupEl.append(helpTextEl);
                        if (addValidationStateIcons) {
                            frmGroupEl.append(angular.element('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'));
                        }
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    enableValidationStateIcons: enableValidationStateIcons,
                    key: 'bs3'
                };
            }
        ]);
}(angular));

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

    angular.module('jcs-autoValidate')
        .factory('defaultErrorMessageResolver', [
            '$q',
            function ($q) {
                var errorMessages = {
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
                            errMsg = errorMessages[errorType],
                            parameters = [],
                            parameter;

                        if (errMsg === undefined) {
                            errMsg = errorMessages.defaultMsg.format(errorType);
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
                        return defer.promise;
                    };

                return {
                    errorMessages: errorMessages,
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
                var reset = function (el) {
                        el.find('small.error').remove();
                        el.removeClass('error');
                    },
                    findParentColumn = function (el) {
                        return el.closest('.columns');
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
                        reset(parentColumn && parentColumn.length > 0 ? parentColumn : el);
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
                        reset(parentColumn || el);
                        el.addClass('error');
                        if (parentColumn) {
                            helpTextEl = angular.element('<small class="error">' + errorMsg + '</small>');
                            parentColumn.append(helpTextEl);
                        }
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    key: 'foundation5'
                };
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
