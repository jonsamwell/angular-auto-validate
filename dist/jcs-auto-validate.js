/*
 * angular-auto-validate - v1.19.6 - 2016-08-24
 * https://github.com/jonsamwell/angular-auto-validate
 * Copyright (c) 2016 Jon Samwell (http://www.jonsamwell.com)
 */
(function (String, angular) {
    'use strict';

angular.module('jcs-autoValidate', []);

function ValidatorFn() {
  var elementStateModifiers = {},
    enableValidElementStyling = true,
    enableInvalidElementStyling = true,
    enableFirstInvalidElementScrollingOnSubmit = false,
    validationEnabled = true,
    enableFocusInputError = true,

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

  /**
   * @ngdoc function
   * @name validator#setFocusInputError
   * @methodOf validator
   *
   * @description
   * Globally enables focused input error. This is enabled by default.
   *
   * @param enabled {Boolean} enabled false to disabled focus otherwise false.
   */

  this.setFocusInputError = function (enabled) {
    enableFocusInputError = enabled;
  };

  this.enableFocusInputError = function () {
    return enableFocusInputError;
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

function Bootstrap3ElementModifierFn($log) {
  var addedCustomCss = false,
    customCss = [
      '<style>' +
      '.glyphicon-spin-jcs {' +
      '-webkit-animation: spin 1000ms infinite linear;' +
      'animation: spin 1000ms infinite linear;' +
      '}' +
      '@-webkit-keyframes spin {' +
      '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
      '}' +
      '100% {' +
      '-webkit-transform: rotate(359deg);' +
      'transform: rotate(359deg);' +
      '}' +
      '}' +
      '@keyframes spin {' +
      '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
      '}' +
      '100% {' +
      '-webkit-transform: rotate(359deg);' +
      'transform: rotate(359deg);' +
      '}' +
      '}' +
      '</style>'
    ].join('');

  var reset = function (el) {
      if (addedCustomCss === false) {
        angular.element(document.body).append(angular.element(customCss));
        addedCustomCss = true;
      }

      angular.forEach(el.find('span'), function (spanEl) {
        spanEl = angular.element(spanEl);
        if (spanEl.hasClass('error-msg') || spanEl.hasClass('form-control-feedback') || spanEl.hasClass('control-feedback')) {
          spanEl.remove();
        }
      });

      el.removeClass('has-success has-error has-feedback');
    },
    findWithClassElementAsc = function (el, klass) {
      var returnEl,
        parent = el;
      for (var i = 0; i <= 10; i += 1) {
        if (parent !== undefined && parent.hasClass(klass)) {
          returnEl = parent;
          break;
        } else if (parent !== undefined) {
          parent = parent.parent();
        }
      }

      return returnEl;
    },

    findWithClassElementDesc = function (el, klass) {
      var child;
      for (var i = 0; i < el.children.length; i += 1) {
        child = el.children[i];
        if (child !== undefined && angular.element(child).hasClass(klass)) {
          break;
        } else if (child.children !== undefined) {
          child = findWithClassElementDesc(child, klass);
          if (child.length > 0) {
            break;
          }
        }
      }

      return angular.element(child);
    },

    findFormGroupElement = function (el) {
      return findWithClassElementAsc(el, 'form-group');
    },

    findInputGroupElement = function (el) {
      return findWithClassElementDesc(el, 'input-group');
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
      var frmGroupEl = findFormGroupElement(el),
        inputGroupEl,
        withValidationStateIcon = false,
        correctElementToPlaceIconAfter;

      if (frmGroupEl) {
        reset(frmGroupEl);
        inputGroupEl = findInputGroupElement(frmGroupEl[0]);
        if (addValidationStateIcons) {
          correctElementToPlaceIconAfter = getCorrectElementToPlaceIconAfter(el);
          withValidationStateIcon = angular.isDefined(correctElementToPlaceIconAfter);
        }
        frmGroupEl.addClass('has-success ' + (inputGroupEl.length > 0 || !withValidationStateIcon ? '' : 'has-feedback'));
        if (withValidationStateIcon) {
          var iconElText = '<span class="glyphicon glyphicon-ok form-control-feedback"></span>';
          if (inputGroupEl.length > 0) {
            iconElText = iconElText.replace('form-', '');
            iconElText = '<span class="input-group-addon control-feedback">' + iconElText + '</span>';
          }

          insertAfter(correctElementToPlaceIconAfter, angular.element(iconElText));
        }
      } else {
        $log.error('Angular-auto-validate: invalid bs3 form structure elements must be wrapped by a form-group class');
      }
    },

    getCorrectElementToPlaceHelpTextAfter = function (el, inputGroupEl) {
      if (inputGroupEl.length > 0) {
        return inputGroupEl;
      }
      var correctEl = el,
        elType = el[0].type ? el[0].type.toLowerCase() : '';

      if ((elType === 'checkbox' || elType === 'radio') && el.parent()[0].nodeName.toLowerCase() === 'label') {
        correctEl = el.parent();
        if (correctEl.hasClass("btn") && correctEl.parent().hasClass("btn-group")) {
          correctEl = correctEl.parent();
        }
      }

      return correctEl;
    },

    getCorrectElementToPlaceIconAfter = function (el) {
      var elType = el[0].type ? el[0].type.toLowerCase() : '',
        elNodeName = el[0].nodeName.toLowerCase();

      if (elType === 'checkbox' || elType === 'radio' || elNodeName === 'select') {
        return undefined;
      }
      return el;
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
        helpTextEl = angular.element('<span class="help-block has-error error-msg">' + errorMsg + '</span>'),
        inputGroupEl,
        withValidationStateIcon = false,
        correctElementToPlaceIconAfter;

      if (frmGroupEl) {
        reset(frmGroupEl);
        inputGroupEl = findInputGroupElement(frmGroupEl[0]);
        if (addValidationStateIcons) {
          correctElementToPlaceIconAfter = getCorrectElementToPlaceIconAfter(el);
          withValidationStateIcon = angular.isDefined(correctElementToPlaceIconAfter);
        }
        frmGroupEl.addClass('has-error ' + (inputGroupEl.length > 0 || !withValidationStateIcon ? '' : 'has-feedback'));

        var helpBlockContainers = findWithClassElementDesc(frmGroupEl[0], 'help-block-cont');
        if (helpBlockContainers.length > 0) {
          helpBlockContainers[0].appendChild(helpTextEl[0]);
        } else {
          insertAfter(getCorrectElementToPlaceHelpTextAfter(el, inputGroupEl), helpTextEl);
        }

        if (withValidationStateIcon) {
          var iconElText = '<span class="glyphicon glyphicon-remove form-control-feedback"></span>';
          if (inputGroupEl.length > 0) {
            iconElText = iconElText.replace('form-', '');
            iconElText = '<span class="input-group-addon control-feedback">' + iconElText + '</span>';
          }

          insertAfter(correctElementToPlaceIconAfter, angular.element(iconElText));
        }
      } else {
        $log.error('Angular-auto-validate: invalid bs3 form structure elements must be wrapped by a form-group class');
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
      if (frmGroupEl) {
        reset(frmGroupEl);
      } else {
        $log.error('Angular-auto-validate: invalid bs3 form structure elements must be wrapped by a form-group class');
      }
    },

    waitForAsyncValidators = function (el) {
      var frmGroupEl = findFormGroupElement(el),
        inputGroupEl,
        withValidationStateIcon = false,
        correctElementToPlaceIconAfter;

      if (frmGroupEl) {
        reset(frmGroupEl);
        inputGroupEl = findInputGroupElement(frmGroupEl[0]);
        if (addValidationStateIcons) {
          correctElementToPlaceIconAfter = getCorrectElementToPlaceIconAfter(el);
          withValidationStateIcon = angular.isDefined(correctElementToPlaceIconAfter);
        }
        frmGroupEl.addClass('has-feedback ' + (inputGroupEl.length > 0 || !withValidationStateIcon ? '' : 'has-feedback'));
        if (withValidationStateIcon) {
          var iconElText = '<span class="glyphicon glyphicon-repeat glyphicon-spin-jcs form-control-feedback"></span>';
          if (inputGroupEl.length > 0) {
            iconElText = iconElText.replace('form-', '');
            iconElText = '<span class="input-group-addon control-feedback">' + iconElText + '</span>';
          }

          insertAfter(correctElementToPlaceIconAfter, angular.element(iconElText));
        }
      } else {
        $log.error('Angular-auto-validate: invalid bs3 form structure elements must be wrapped by a form-group class');
      }
    };

  return {
    makeValid: makeValid,
    makeInvalid: makeInvalid,
    makeDefault: makeDefault,
    waitForAsyncValidators: waitForAsyncValidators,
    enableValidationStateIcons: enableValidationStateIcons,
    key: 'bs3'
  };
}

Bootstrap3ElementModifierFn.$inject = [
  '$log'
];

angular.module('jcs-autoValidate').factory('bootstrap3ElementModifier', Bootstrap3ElementModifierFn);

/*
 * Taken from https://github.com/angular/angular.js/issues/2690#issue-14462164 (with added tests of course!)
 */
function JCSDebounceFn($timeout) {
  var debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };

      var callNow = immediate && !timeout;
      $timeout.cancel(timeout);
      timeout = $timeout(later, wait, false);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  return {
    debounce: debounce
  };
}

JCSDebounceFn.$inject = [
  '$timeout'
];

angular.module('jcs-autoValidate').factory('jcs-debounce', JCSDebounceFn);

/**
 * Replaces string placeholders with corresponding template string
 */
function formatString(string, params) {
  return string.replace(/{(\d+)}/g, function (match, number) {
    return typeof params[number] !== undefined ? params[number] : match;
  });
}

angular.autoValidate = angular.autoValidate || {
  errorMessages: {}
};

angular.autoValidate.errorMessages['default'] = {
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
  url: 'Please enter a valid URL in the format of http(s)://www.google.com'
};

function DefaultErrorMessageResolverFn($q, $http) {
  var currentCulture = 'default',

    i18nFileRootPath = 'js/angular-auto-validate/dist/lang',

    cultureRetrievalPromise,

    loadRemoteCulture = function (culture) {
      cultureRetrievalPromise = $http.get(formatString('{0}/jcs-auto-validate_{1}.json', [i18nFileRootPath, culture.toLowerCase()]));
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

    getMessageTypeOverride = function (errorType, el) {
      var overrideKey;

      if (el) {
        // try and find an attribute which overrides the given error type in the form of errorType-err-type="someMsgKey"
        errorType += '-err-type';


        overrideKey = el.attr('ng-' + errorType);
        if (overrideKey === undefined) {
          overrideKey = el.attr('data-ng-' + errorType) || el.attr(errorType);
        }

        if (overrideKey) {
          overrideKey = overrideKey.replace(/[\W]/g, '');
        }
      }

      return overrideKey;
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
        parameter,
        messageTypeOverride;

      if (cultureRetrievalPromise !== undefined) {
        cultureRetrievalPromise.then(function () {
          resolve(errorType, el).then(function (msg) {
            defer.resolve(msg);
          });
        });
      } else {
        errMsg = angular.autoValidate.errorMessages[currentCulture][errorType];
        messageTypeOverride = getMessageTypeOverride(errorType, el);
        if (messageTypeOverride) {
          errMsg = angular.autoValidate.errorMessages[currentCulture][messageTypeOverride];
        }

        if (errMsg === undefined && messageTypeOverride !== undefined) {
          errMsg = formatString(angular.autoValidate.errorMessages[currentCulture].defaultMsg, [messageTypeOverride]);
        } else if (errMsg === undefined) {
          errMsg = formatString(angular.autoValidate.errorMessages[currentCulture].defaultMsg, [errorType]);
        }

        if (el && el.attr) {
          try {
            parameter = el.attr('ng-' + errorType);
            if (parameter === undefined) {
              parameter = el.attr('data-ng-' + errorType) || el.attr(errorType);
            }

            parameters.push(parameter || '');

            errMsg = formatString(errMsg, parameters);
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

DefaultErrorMessageResolverFn.$inject = [
  '$q',
  '$http'
];

angular.module('jcs-autoValidate').factory('defaultErrorMessageResolver', DefaultErrorMessageResolverFn);

function Foundation5ElementModifierFn() {
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
        if (parent !== undefined && (parent.hasClass('columns') || parent.hasClass('column'))) {
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

angular.module('jcs-autoValidate').factory('foundation5ElementModifier', Foundation5ElementModifierFn);

function foundation6ElementModifierFn() {
  var reset = function (el, inputEl) {
      angular.forEach(el.find('small'), function (smallEl) {
        if (angular.element(smallEl).hasClass('form-error is-visible')) {
          angular.element(smallEl).remove();
        }
      });

      inputEl.removeClass('alert callout');
    },
    findParentColumn = function (el) {
      var parent = el;
      for (var i = 0; i <= 3; i += 1) {
        if (parent !== undefined && (parent.hasClass('columns') || parent.hasClass('column'))) {
          break;
        } else if (parent !== undefined) {
          parent = parent.parent();
        }
      }

      return parent;
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeValid
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear valid by apply Foundation 6 specific styles and child elements.
     * See: http://foundation.zurb.com/sites/docs/forms.html
     *
     * @param {Element} el - The input control element that is the target of the validation.
     */
    makeValid = function (el) {
      var parentColumn = findParentColumn(el);
      reset(parentColumn && parentColumn.length > 0 ? parentColumn : el, el);
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeInvalid
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear invalid by apply Foundation 6 specific styles and child elements.
     * See: http://foundation.zurb.com/sites/docs/forms.html
     *
     * @param {Element} el - The input control element that is the target of the validation.
     */
    makeInvalid = function (el, errorMsg) {
      var parentColumn = findParentColumn(el),
        helpTextEl;
      reset(parentColumn || el, el);
      el.addClass('alert callout');
      if (parentColumn) {
        helpTextEl = angular.element('<small class="form-error is-visible">' + errorMsg + '</small>');
        parentColumn.append(helpTextEl);
      }
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeDefault
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear in its default visual state by apply Foundation 6 specific styles and child elements.
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
    key: 'foundation6'
  };
}

angular.module('jcs-autoValidate').factory('foundation6ElementModifier', foundation6ElementModifierFn);

function ElementUtilsFn() {
  var isElementVisible = function (el) {
    return el[0].offsetWidth > 0 && el[0].offsetHeight > 0;
  };

  return {
    isElementVisible: isElementVisible
  };
}

function ValidationManagerFn(validator, elementUtils, $anchorScroll) {
  var elementTypesToValidate = ['input', 'textarea', 'select', 'form'],

    elementIsVisible = function (el) {
      return elementUtils.isElementVisible(el);
    },

    getFormOptions = function (el) {
      var frmCtrl = angular.element(el).controller('form'),
        options;

      if (frmCtrl !== undefined && frmCtrl !== null) {
        options = frmCtrl.autoValidateFormOptions;
      } else {
        options = validator.defaultFormValidationOptions;
      }

      return options;
    },

    /**
     * Only validate if the element is present, it is visible, if it is not a comment,
     * it is either a valid user input control (input, select, textare, form) or
     * it is a custom control register by the developer.
     * @param el
     * @param formOptions The validation options of the parent form
     * @returns {boolean} true to indicate it should be validated
     */
    shouldValidateElement = function (el, formOptions, formSubmitted) {
      var elementExists = el && el.length > 0,
        isElementAComment = elementExists && el[0].nodeName.toLowerCase() === '#comment',
        correctVisibilityToValidate,
        correctTypeToValidate,
        correctPhaseToValidate;

      if (elementExists && isElementAComment === false) {
        correctVisibilityToValidate = elementIsVisible(el) || formOptions.validateNonVisibleControls;
        correctTypeToValidate = elementTypesToValidate.indexOf(el[0].nodeName.toLowerCase()) > -1 ||
          el[0].hasAttribute('register-custom-form-control');
        correctPhaseToValidate = formOptions.validateOnFormSubmit === false ||
          (formOptions.validateOnFormSubmit === true && formSubmitted === true);
      }

      return elementExists && !isElementAComment && correctVisibilityToValidate && correctTypeToValidate && correctPhaseToValidate;

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
        if ((frmOptions.forceValidation ||
            (shouldValidateElement(el, frmOptions, frmOptions.getFormController().$submitted) &&
              modelCtrl &&
              needsValidation))) {
          isValid = !modelCtrl.$invalid;

          if (frmOptions.removeExternalValidationErrorsOnSubmit && modelCtrl.removeAllExternalValidation) {
            modelCtrl.removeAllExternalValidation();
          }

          if (modelCtrl.$pending !== undefined && options.waitForAsyncValidators === true) {
            // we have pending async validators
            validator.waitForAsyncValidators(el);
          } else {
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
        firstElementError = null,
        frmCtrl = frmElement ? angular.element(frmElement).controller('form') : undefined,
        processElement = function (ctrlElement, force, formOptions) {
          var controller, isValid, ctrlFormOptions, originalForceValue;

          ctrlElement = angular.element(ctrlElement);
          controller = ctrlElement.controller('ngModel');

          if (controller !== undefined && (force || shouldValidateElement(ctrlElement, formOptions, frmCtrl.$submitted))) {
            if (ctrlElement[0].nodeName.toLowerCase() === 'form') {
              // we probably have a sub form
              validateForm(ctrlElement);
            } else {
              // we need to get the options for the element rather than use the passed in as the
              // element could be an ng-form and have different options to the parent form.
              ctrlFormOptions = getFormOptions(ctrlElement);
              originalForceValue = ctrlFormOptions.forceValidation;
              ctrlFormOptions.forceValidation = force;
              try {
                isValid = validateElement(controller, ctrlElement, ctrlFormOptions);
                if (validator.enableFocusInputError() && !isValid && frmValid) {
                  if (!firstElementError) {
                    firstElementError = ctrlElement[0];
                    firstElementError.focus();
                  }
                }
                if (validator.firstInvalidElementScrollingOnSubmitEnabled() && !isValid && frmValid) {
                  var ctrlElementId = ctrlElement.attr('id');
                  if (ctrlElementId) {
                    $anchorScroll(ctrlElementId);
                  }
                }
                frmValid = frmValid && isValid;
              } finally {
                ctrlFormOptions.forceValidation = originalForceValue;
              }
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
      angular.forEach((frmElement[0].elements || frmElement[0].all) || frmElement[0], function (ctrlElement) {
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
      if (errorMsg) {
        validator.makeInvalid(element, errorMsg);
      } else {
        validator.getErrorMessage(errorMsgKey, element).then(function (msg) {
          validator.makeInvalid(element, msg);
        });
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

ValidationManagerFn.$inject = [
  'validator',
  'jcs-elementUtils',
  '$anchorScroll'
];

angular.module('jcs-autoValidate').factory('jcs-elementUtils', ElementUtilsFn);
angular.module('jcs-autoValidate').factory('validationManager', ValidationManagerFn);

function parseBooleanAttributeValue(val, defaultValue) {
  if ((val === undefined || val === null) && defaultValue !== undefined) {
    return defaultValue;
  } else {
    return val !== 'false';
  }
}

function parseOptions(ctrl, validator, attrs) {
  var opts = ctrl.autoValidateFormOptions = ctrl.autoValidateFormOptions || angular.copy(validator.defaultFormValidationOptions);

  // needed to stop circular ref in json serialisation
  opts.getFormController = function () {
    return ctrl;
  };
  opts.waitForAsyncValidators = parseBooleanAttributeValue(attrs.waitForAsyncValidators, opts.waitForAsyncValidators);
  opts.forceValidation = false;
  opts.disabled = !validator.isEnabled() || parseBooleanAttributeValue(attrs.disableDynamicValidation, opts.disabled);
  opts.validateNonVisibleControls = parseBooleanAttributeValue(attrs.validateNonVisibleControls, opts.validateNonVisibleControls);
  opts.validateOnFormSubmit = parseBooleanAttributeValue(attrs.validateOnFormSubmit, opts.validateOnFormSubmit);
  opts.removeExternalValidationErrorsOnSubmit = attrs.removeExternalValidationErrorsOnSubmit === undefined ?
    opts.removeExternalValidationErrorsOnSubmit :
    parseBooleanAttributeValue(attrs.removeExternalValidationErrorsOnSubmit, opts.removeExternalValidationErrorsOnSubmit);

  // the library might be globally disabled but enabled on a particular form so check the
  // disableDynamicValidation attribute is on the form
  if (validator.isEnabled() === false && attrs.disableDynamicValidation === 'false') {
    opts.disabled = false;
  }
}

angular.module('jcs-autoValidate').directive('form', [
  'validator',
  function (validator) {
    return {
      restrict: 'E',
      require: 'form',
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
      restrict: 'EA',
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

function FormResetDirectiveFn(validationManager) {
  return {
    restrict: 'E',
    link: function (scope, el) {
      var formController = el.controller('form');

      function resetFn() {
        validationManager.resetForm(el);
        if (formController.$setPristine) {
          formController.$setPristine();
        }

        if (formController.$setUntouched) {
          formController.$setUntouched();
        }
      }

      if (formController !== undefined &&
        formController.autoValidateFormOptions &&
        formController.autoValidateFormOptions.disabled === false) {
        el.on('reset', resetFn);

        scope.$on('$destroy', function () {
          el.off('reset', resetFn);
        });
      }
    }
  };
}

FormResetDirectiveFn.$inject = [
  'validationManager'
];

angular.module('jcs-autoValidate').directive('form', FormResetDirectiveFn);

function RegisterCustomFormControlFn() {
  var findParentForm = function (el) {
    var parent = el;
    for (var i = 0; i <= 50; i += 1) {
      if (parent !== undefined && parent.nodeName.toLowerCase() === 'form') {
        break;
      } else if (parent !== undefined) {
        parent = angular.element(parent).parent()[0];
      }
    }

    return parent;
  };

  return {
    restrict: 'A',
    link: function (scope, element) {
      var frmEl = findParentForm(element.parent()[0]);
      if (frmEl) {
        frmEl.customHTMLFormControlsCollection = frmEl.customHTMLFormControlsCollection || [];
        frmEl.customHTMLFormControlsCollection.push(element[0]);
      }
    }
  };
}

angular.module('jcs-autoValidate').directive('registerCustomFormControl', RegisterCustomFormControlFn);

function SubmitDecorator($delegate, $parse, validationManager) {
  $delegate[0].compile = function ($element, attrs) {
    var fn = $parse(attrs.ngSubmit),
      force = attrs.ngSubmitForce === 'true';

    return function (scope, element) {
      var formController = element.controller('form'),
        resetListenerOffFn;

      function handlerFn(event) {
        scope.$apply(function () {
          if (formController !== undefined &&
            formController !== null &&
            formController.autoValidateFormOptions &&
            formController.autoValidateFormOptions.disabled === true) {
            fn(scope, {
              $event: event
            });
          } else {
            if (formController.$setSubmitted === undefined) {
              // we probably have angular <= 1.2
              formController.$submitted = true;
            }

            if (validationManager.validateForm(element) || force === true) {
              fn(scope, {
                $event: event
              });
            }
          }
        });
      }

      function resetFormFn() {
        if (element[0].reset) {
          element[0].reset();
        } else {
          validationManager.resetForm(element);
        }
      }

      if (formController && formController.autoValidateFormOptions) {
        // allow the form to be reset programatically or via raising the event
        // form:formName:reset
        formController.autoValidateFormOptions.resetForm = resetFormFn;
        if (formController.$name !== undefined && formController.$name !== '') {
          resetListenerOffFn = scope.$on('form:' + formController.$name + ':reset', resetFormFn);
        }
      }

      element.on('submit', handlerFn);
      scope.$on('$destroy', function () {
        element.off('submit', handlerFn);
        if (resetListenerOffFn) {
          resetListenerOffFn();
        }
      });
    };
  };

  return $delegate;
}

SubmitDecorator.$inject = [
  '$delegate',
  '$parse',
  'validationManager'
];

function ProviderFn($provide) {
  $provide.decorator('ngSubmitDirective', SubmitDecorator);
}

ProviderFn.$inject = [
  '$provide'
];

angular.module('jcs-autoValidate').config(ProviderFn);

angular.module('jcs-autoValidate').config(['$provide',
  function ($provide) {
    $provide.decorator('ngModelDirective', [
      '$timeout',
      '$delegate',
      'validationManager',
      'jcs-debounce',
      function ($timeout, $delegate, validationManager, debounce) {
        var directive = $delegate[0],
          link = directive.link || directive.compile;

        directive.compile = function (el) {
          var supportsNgModelOptions = angular.version.major >= 1 && angular.version.minor >= 3,
            originalLink = link;

          // in the RC of 1.3 there is no directive.link only the directive.compile which
          // needs to be invoked to get at the link functions.
          if (supportsNgModelOptions && angular.isFunction(link)) {
            originalLink = link(el);
          }

          return {
            pre: function (scope, element, attrs, ctrls) {
              var ngModelCtrl = ctrls[0],
                frmCtrl = ctrls[1],
                ngModelOptions = attrs.ngModelOptions === undefined ? undefined : scope.$eval(attrs.ngModelOptions),
                setValidity = ngModelCtrl.$setValidity,
                setPristine = ngModelCtrl.$setPristine,
                setValidationState = debounce.debounce(function () {
                  var validateOptions = frmCtrl !== undefined && frmCtrl !== null ? frmCtrl.autoValidateFormOptions : undefined;
                  validationManager.validateElement(ngModelCtrl, element, validateOptions);
                }, 100);

              if (attrs.formnovalidate === undefined &&
                (frmCtrl !== undefined && frmCtrl !== null && frmCtrl.autoValidateFormOptions &&
                  frmCtrl.autoValidateFormOptions.disabled === false)) {
                // if the version of angular supports ng-model-options let angular handle the element.on bit
                // fixes issue with async validators
                if (supportsNgModelOptions ||
                  (!supportsNgModelOptions || ngModelOptions === undefined || ngModelOptions.updateOn === undefined || ngModelOptions.updateOn === '')) {
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

                // We override this so we can reset the element state when it is called.
                ngModelCtrl.$setPristine = function () {
                  setPristine.call(ngModelCtrl);
                  validationManager.resetElement(element);
                };

                ngModelCtrl.autoValidated = true;
              }

              ngModelCtrl.setExternalValidation = function (errorMsgKey, errorMessage, addToModelErrors) {
                if (addToModelErrors) {
                  ngModelCtrl.$setValidity(errorMsgKey, false);
                }

                ngModelCtrl.externalErrors = ngModelCtrl.externalErrors || {};
                ngModelCtrl.externalErrors[errorMsgKey] = false;
                validationManager.setElementValidationError(element, errorMsgKey, errorMessage);
              };

              ngModelCtrl.removeExternalValidation = function (errorMsgKey, addToModelErrors) {
                if (addToModelErrors) {
                  ngModelCtrl.$setValidity(errorMsgKey, true);
                  var collection = ngModelCtrl.$error || ngModelCtrl.$errors;
                  delete collection[errorMsgKey];
                }

                if (ngModelCtrl.externalErrors) {
                  delete ngModelCtrl.externalErrors[errorMsgKey];
                }

                validationManager.resetElement(element);
              };

              ngModelCtrl.removeAllExternalValidation = function () {
                if (ngModelCtrl.externalErrors) {
                  var errorCollection = ngModelCtrl.$error || ngModelCtrl.$errors;
                  angular.forEach(ngModelCtrl.externalErrors, function (value, key) {
                    ngModelCtrl.$setValidity(key, true);
                    delete errorCollection[key];
                  });

                  ngModelCtrl.externalErrors = {};
                  validationManager.resetElement(element);
                }
              };

              if (frmCtrl) {
                frmCtrl.setExternalValidation = function (modelProperty, errorMsgKey, errorMessageOverride, addToModelErrors) {
                  var success = false;
                  if (frmCtrl[modelProperty]) {
                    frmCtrl[modelProperty].setExternalValidation(errorMsgKey, errorMessageOverride, addToModelErrors);
                    success = true;
                  }

                  return success;
                };

                frmCtrl.removeExternalValidation = function (modelProperty, errorMsgKey, errorMessageOverride, addToModelErrors) {
                  var success = false;
                  if (frmCtrl[modelProperty]) {
                    frmCtrl[modelProperty].removeExternalValidation(errorMsgKey, addToModelErrors);
                    success = true;
                  }

                  return success;
                };
              }

              return originalLink.pre ?
                originalLink.pre.apply(this, arguments) :
                this;
            },
            post: function (scope, element, attrs, ctrls) {
              return originalLink.post ?
                originalLink.post.apply(this, arguments) :
                originalLink.apply(this, arguments);
            }
          };
        };

        return $delegate;
      }
    ]);
  }
]);

function AutoValidateRunFn(validator, defaultErrorMessageResolver, bootstrap3ElementModifier, foundation5ElementModifier, foundation6ElementModifier) {
  validator.setErrorMessageResolver(defaultErrorMessageResolver.resolve);
  validator.registerDomModifier(bootstrap3ElementModifier.key, bootstrap3ElementModifier);
  validator.registerDomModifier(foundation5ElementModifier.key, foundation5ElementModifier);
  validator.registerDomModifier(foundation6ElementModifier.key, foundation6ElementModifier);
  validator.setDefaultElementModifier(bootstrap3ElementModifier.key);
}

AutoValidateRunFn.$inject = [
  'validator',
  'defaultErrorMessageResolver',
  'bootstrap3ElementModifier',
  'foundation5ElementModifier',
  'foundation6ElementModifier'
];

angular.module('jcs-autoValidate').run(AutoValidateRunFn);

}(String, angular));
