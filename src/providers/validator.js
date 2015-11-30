function ValidatorFn() {
  var elementStateModifiers = {},
    enableValidElementStyling = true,
    enableInvalidElementStyling = true,
    enableFirstInvalidElementScrollingOnSubmit = false,
    validationEnabled = true,

    toBoolean = function (value) {
      var v;
      if (value && value.length !== 0) {
        v = value.toLowerCase();
        value = !(v === 'f' || v === '0' || v === 'false');
      } else {
        value = false;
      }

      return value;
    },

    getAttributeValue = function (el, attrName) {
      var val;

      if (el !== undefined) {
        val = el.attr(attrName) || el.attr('data-' + attrName);
      }

      return val;
    },

    attributeExists = function (el, attrName) {
      var exists;

      if (el !== undefined) {
        exists = el.attr(attrName) !== undefined || el.attr('data-' + attrName) !== undefined;
      }

      return exists;
    },

    getBooleanAttributeValue = function (el, attrName) {
      return toBoolean(getAttributeValue(el, attrName));
    },

    validElementStylingEnabled = function (el) {
      return enableValidElementStyling && !getBooleanAttributeValue(el, 'disable-valid-styling');
    },

    autoValidateEnabledOnControl = function (el) {
      return !getBooleanAttributeValue(el, 'disable-auto-validate');
    },

    invalidElementStylingEnabled = function (el) {
      return enableInvalidElementStyling && !getBooleanAttributeValue(el, 'disable-invalid-styling');
    };

  /**
   * @ngdoc function
   * @name validator#enable
   * @methodOf validator
   *
   * @description
   * By default auto validate will validate all forms and elements with an ngModel directive on.  By
   * setting enabled to false you will explicitly have to opt in to enable validation on forms and child
   * elements.
   *
   * Note: this can be overridden by add the 'auto-validate-enabled="true/false' attribute to a form.
   *
   * Example:
   * <pre>
   *  app.config(function (validator) {
   *    validator.enable(false);
   *  });
   * </pre>
   *
   * @param {Boolean} isEnabled true to enable, false to disable.
   */
  this.enable = function (isEnabled) {
    validationEnabled = isEnabled;
  };

  /**
   * @ngdoc function
   * @name validator#isEnabled
   * @methodOf validator
   *
   * @description
   * Returns true if the library is enabeld.
   *
   * @return {Boolean} true if enabled, otherwise false.
   */
  this.isEnabled = function () {
    return validationEnabled;
  };

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
    var defer;
    if (this.errorMessageResolver === undefined) {
      throw new Error('Please set an error message resolver via the setErrorMessageResolver function before attempting to resolve an error message.');
    }

    if (attributeExists(el, 'disable-validation-message')) {
      defer = angular.injector(['ng']).get('$q').defer();
      defer.resolve('');
      return defer.promise;
    } else {
      return this.errorMessageResolver(errorKey, el);
    }
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

  /**
   * @ngdoc function
   * @name validator#setFirstInvalidElementScrollingOnSubmit
   * @methodOf validator
   *
   * @description
   * Globally enables first invalid element scrolling on form submit. This is disabled by default.
   *
   * @param enabled {Boolean} enabled True to enable scrolling otherwise false.
   */
  this.setFirstInvalidElementScrollingOnSubmit = function (enabled) {
    enableFirstInvalidElementScrollingOnSubmit = enabled;
  };

  this.firstInvalidElementScrollingOnSubmitEnabled = function () {
    return enableFirstInvalidElementScrollingOnSubmit;
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
    if (autoValidateEnabledOnControl(el)) {
      if (validElementStylingEnabled(el)) {
        this.getDomModifier(el).makeValid(el);
      } else {
        this.makeDefault(el);
      }
    }
  };

  this.makeInvalid = function (el, errorMsg) {
    if (autoValidateEnabledOnControl(el)) {
      if (invalidElementStylingEnabled(el)) {
        this.getDomModifier(el).makeInvalid(el, errorMsg);
      } else {
        this.makeDefault(el);
      }
    }
  };

  this.makeDefault = function (el) {
    if (autoValidateEnabledOnControl(el)) {
      var dm = this.getDomModifier(el);
      if (dm.makeDefault) {
        dm.makeDefault(el);
      }
    }
  };

  this.waitForAsyncValidators = function (el) {
    if (autoValidateEnabledOnControl(el)) {
      var dm = this.getDomModifier(el);
      if (dm.waitForAsyncValidators) {
        dm.waitForAsyncValidators(el);
      }
    }
  };

  this.defaultFormValidationOptions = {
    forceValidation: false,
    disabled: false,
    validateNonVisibleControls: false,
    removeExternalValidationErrorsOnSubmit: true,
    validateOnFormSubmit: false,
    waitForAsyncValidators: true
  };

  this.$get = [
    function () {
      return this;
    }
  ];
}

angular.module('jcs-autoValidate').provider('validator', ValidatorFn);
