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
