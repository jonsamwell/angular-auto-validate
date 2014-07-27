(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('form', [
        'validationManager',
        function (validationManager) {
            return {
                restrict: 'E',
                link: function (scope, el) {
                    var unbind = el.on('reset', function () {
                        validationManager.resetForm(el);
                    });

                    scope.$on('$destroy', unbind);
                }
            };
        }
    ]);
}(angular));
