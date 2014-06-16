(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').config(['$provide',
        function ($provide) {
            $provide.decorator('ngFormDirective', [
                '$delegate',
                'validationManager',
                function ($delegate, validationManager) {
                    var directive = $delegate[0],
                        link = directive.link;

                    directive.compile = function () {
                        return function (scope, element, attrs, ctrls) {

                            link.apply(this, arguments);
                        };
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
}(angular));
