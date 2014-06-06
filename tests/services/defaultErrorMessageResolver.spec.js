(function (angular, sinon) {
    'use strict';

    describe('jcs-autoValidate defaultErrorMessageResolver', function () {
        var sandbox, $rootScope, defaultErrorMessageResolver;

        beforeEach(module('jcs-autoValidate'));

        describe('defaultErrorMessageResolver', function () {
            beforeEach(inject(function ($injector) {
                sandbox = sinon.sandbox.create();
                $rootScope = $injector.get('$rootScope');
                defaultErrorMessageResolver = $injector.get('defaultErrorMessageResolver');
            }));

            afterEach(function () {
                sandbox.restore();
            });

            it('should be defined', function () {
                expect(defaultErrorMessageResolver).to.exist;
            });

            describe('errorMessages', function () {
                it('should be an object', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages).to.not.equal(undefined);
                });

                it('should have the key defaultMsg', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.defaultMsg).to.not.equal(undefined);
                });

                it('should have the key email', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.email).to.not.equal(undefined);
                });

                it('should have the key minlength', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.minlength).to.not.equal(undefined);
                });

                it('should have the key maxlength', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.maxlength).to.not.equal(undefined);
                });

                it('should have the key min', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.min).to.not.equal(undefined);
                });

                it('should have the key max', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.max).to.not.equal(undefined);
                });

                it('should have the key required', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.required).to.not.equal(undefined);
                });

                it('should have the key date', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.date).to.not.equal(undefined);
                });

                it('should have the key pattern', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.pattern).to.not.equal(undefined);
                });

                it('should have the key number', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.number).to.not.equal(undefined);
                });

                it('should have the key url', function () {
                    var errorMessages = defaultErrorMessageResolver.errorMessages;

                    expect(errorMessages.url).to.not.equal(undefined);
                });
            });

            describe('resolve', function () {
                it('should return a promise', function () {
                    var promise = defaultErrorMessageResolver.resolve('required');

                    expect(promise).to.not.equal(undefined);
                    expect(promise.then).to.not.equal(undefined);
                });

                it('should return the default error message when the error type is not found', function (done) {
                    var errorType = 'not_present';
                    defaultErrorMessageResolver.resolve(errorType).then(function (msg) {
                        expect(msg).to.equal('Please add error message for ' + errorType);
                        done();
                    });

                    $rootScope.$apply();
                });

                it('should return only the error message if the element is undefined', function (done) {
                    var errorType = 'required';
                    defaultErrorMessageResolver.resolve(errorType).then(function (msg) {
                        expect(msg).to.equal('This field is required');
                        done();
                    });

                    $rootScope.$apply();
                });

                it('should replace parameters in error message it element is passed has data-* attribute of errorType', function (done) {
                    var errorType = 'minlength',
                        element = angular.element('<input type="text" data-ng-minlength="2" />');
                    defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
                        expect(msg).to.equal('Please enter at least 2 characters');
                        done();
                    });

                    $rootScope.$apply();
                });

                it('should replace parameters in error message it element is passed has ng-* attribute of errorType', function (done) {
                    var errorType = 'minlength',
                        element = angular.element('<input type="text" ng-minlength="2" />');
                    defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
                        expect(msg).to.equal('Please enter at least 2 characters');
                        done();
                    });

                    $rootScope.$apply();
                });
            });
        });
    });
}(angular, sinon));
