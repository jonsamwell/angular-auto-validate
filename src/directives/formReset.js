(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('form', [
        'validationManager',
        function (validationManager) {
            return {
                restrict: 'E',
                link: function (scope, el) {
                    var formController = el.controller('form');

                    if (formController !== undefined &&
                        formController.autoValidateFormOptions &&
                        formController.autoValidateFormOptions.disabled === false) {
                        el.on('reset', function () {
                            validationManager.resetForm(el);
                            if (formController.$setPristine) {
                                formController.$setPristine();
                            }

                            if (formController.$setUntouched) {
                                formController.$setUntouched();
                            }
                        });

                        scope.$on('$destroy', function () {
                            el.off('reset');
                        });
                    }
                }
            };
        }
    ]);
}(angular));
