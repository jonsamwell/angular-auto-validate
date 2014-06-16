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
                        var fn = $parse(attr['ng-submit']);
                        return function (scope, element) {
                            element.on('submit', function (event) {
                                scope.$apply(function () {
                                    if (validationManager.validateForm(element)) {
                                        console.log(3);

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
