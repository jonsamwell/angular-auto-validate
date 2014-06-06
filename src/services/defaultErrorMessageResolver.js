(function (String, angular) {
    'use strict';

    /**
     * Replaces string placeholders with corresponding template string
     */
    if (!('format' in String.prototype)) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== undefined ? args[number] : match;
            });
        };
    }

    angular.module('jcs-autoValidate')
        .factory('defaultErrorMessageResolver', [
            '$q',
            function ($q) {
                var errorMessages = {
                        defaultMsg: 'Please add error message for {0}',
                        email: 'Please enter a valid email address',
                        minlength: 'Please enter at least {0} characters',
                        maxlength: 'You have entered more than the maximum {0} characters',
                        min: 'Please enter the minimum number of {0}',
                        max: 'Please enter the maximum number of {0}',
                        required: 'This field is required',
                        date: 'Please enter a valid date',
                        pattern: 'Please ensure the entered information adheres to this pattern {0}',
                        number: 'Please enter a valid number',
                        url: 'Please enter a valid URL in the format of http(s)://wwww.google.com'
                    },
                    resolve = function (errorType, el) {
                        var defer = $q.defer(),
                            errMsg = errorMessages[errorType],
                            parameters = [],
                            parameter;

                        console.log(errorMessages);
                        console.log(errorType);

                        if (errMsg === undefined) {
                            errMsg = errorMessages.defaultMsg.format(errorType);
                        }

                        if (el && el.attr) {
                            try {
                                parameter = el.attr(errorType);
                                if (parameter === undefined) {
                                    parameter = el.attr('data-ng-' + errorType) || el.attr('ng-' + errorType);
                                }

                                parameters.push(parameter || '');

                                errMsg = errMsg.format(parameters);
                            } catch (e) {}
                        }

                        defer.resolve(errMsg);
                        return defer.promise;
                    };

                return {
                    errorMessages: errorMessages,
                    resolve: resolve
                };
            }
        ]);
}(String, angular));
