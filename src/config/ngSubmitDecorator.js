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
