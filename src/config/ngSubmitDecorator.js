(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngSubmitDirective', [
                '$delegate',
                '$parse',
                'validationManager',
                'jcs-elementUtils',
                function ($delegate, $parse, validationManager, elementUtils) {
                    $delegate[0].compile = function ($element, attrs) {
                        var fn = $parse(attrs.ngSubmit),
                            isForcedSubmit = attrs.ngSubmitForce === 'true';

                        return function (scope, element) {
                            function handlerFn(event) {
                                scope.$apply(function () {
                                    var isFormValid;
                                    var isDisabled;
                                    var errorsAllowedOnSubmit;
                                    var hasOnlyAllowedErrors;
                                    var formController = $element.controller('form');

                                    if (formController === undefined || formController === null || !formController.autoValidateFormOptions) {
                                        return;
                                    }

                                    isFormValid = validationManager.validateForm(element);
                                    isDisabled = formController.autoValidateFormOptions.disabled === true;
                                    errorsAllowedOnSubmit = formController.autoValidateFormOptions.errorsAllowedOnSubmit;
                                    hasOnlyAllowedErrors = errorsAllowedOnSubmit.length > 0 && !elementUtils.hasErrorsOtherThanExcluded(formController, errorsAllowedOnSubmit);

                                    if (isDisabled || isForcedSubmit || isFormValid || (!isFormValid && hasOnlyAllowedErrors)) {
                                        fn(scope, {
                                            $event: event
                                        });
                                    }
                                });
                            }

                            element.on('submit', handlerFn);
                            scope.$on('$destroy', function () {
                                element.off('submit', handlerFn);
                            });
                        };
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
}(angular));
