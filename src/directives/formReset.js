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
