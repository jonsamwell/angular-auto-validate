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
