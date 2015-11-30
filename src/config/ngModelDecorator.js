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
                  var collection = ngModelCtrl.$error || ngModelCtrl.$errors;
                  collection[errorMsgKey] = false;
                }

                ngModelCtrl.externalErrors = ngModelCtrl.externalErrors || {};
                ngModelCtrl.externalErrors[errorMsgKey] = false;
                validationManager.setElementValidationError(element, errorMsgKey, errorMessage);
              };

              ngModelCtrl.removeExternalValidation = function (errorMsgKey, addToModelErrors) {
                if (addToModelErrors) {
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
