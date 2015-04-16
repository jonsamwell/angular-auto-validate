(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngSubmitDirective', [
                '$delegate',
                '$parse',
                'validationManager',
                function ($delegate, $parse, validationManager) {
                    $delegate[0].compile = function ($element, attrs) {
                        var fn = $parse(attrs.ngSubmit),
                            force = attrs.ngSubmitForce === 'true';

                        return function (scope, element) {
                            function handlerFn(event) {
                                scope.$apply(function () {
                                    var formController = $element.controller('form');
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
