(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngSubmitDirective', [
                '$delegate',
                '$parse',
                'validationManager',
                function ($delegate, $parse, validationManager) {
                    $delegate[0].compile = function ($element, attr) {
                        console.log(attr);
                        var fn = $parse(attr.ngSubmit);
                        return function (scope, element) {
                            element.on('submit', function (event) {
                                scope.$apply(function () {
                                    if (validationManager.validateForm(element)) {
                                        fn(scope, {
                                            $event: event
                                        });
                                    }
                                });
                            });
                        };
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
}(angular));
