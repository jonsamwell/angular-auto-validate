(function (angular) {
    'use strict';

    function SubmitDecorator($delegate, $parse, validationManager) {
        $delegate[0].compile = function ($element, attrs) {
            var fn = $parse(attrs.ngSubmit),
                force = attrs.ngSubmitForce === 'true';

            return function (scope, element) {
                var formController = element.controller('form');

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
                            if (validationManager.validateForm(element) || force === true) {
                                fn(scope, {
                                    $event: event
                                });
                            }
                        }
                    });
                }

                function resetFormFn() {
                    validationManager.resetForm(element);
                }

                if (formController && formController.autoValidateFormOptions) {
                    formController.autoValidateFormOptions.resetForm = resetFormFn;
                }

                element.on('submit', handlerFn);
                scope.$on('$destroy', function () {
                    element.off('submit', handlerFn);
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
}(angular));
