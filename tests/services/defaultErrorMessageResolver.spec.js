(function (angular, sinon) {
  'use strict';

  describe('jcs-autoValidate defaultErrorMessageResolver', function () {
    var sandbox, $rootScope, $q, $httpBackend, defaultErrorMessageResolver;

    beforeEach(module('jcs-autoValidate'));

    describe('defaultErrorMessageResolver', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        $httpBackend = $injector.get('$httpBackend');
        $q = $injector.get('$q');
        defaultErrorMessageResolver = $injector.get('defaultErrorMessageResolver');
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        expect(defaultErrorMessageResolver).to.exist;
      });

      describe('getErrorMessages', function () {
        it('should be an object', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key defaultMsg', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.defaultMsg).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key email', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.email).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key minlength', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.minlength).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key maxlength', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.maxlength).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key min', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.min).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key max', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.max).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key required', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.required).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key date', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.date).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key pattern', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.pattern).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key number', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.number).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });

        it('should have the key url', function (done) {
          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            expect(errorMessages.url).to.not.equal(undefined);
            done();
          });

          $rootScope.$apply();
        });
      });

      describe('setI18nFileRootPath', function () {
        it('should be defined', function () {
          expect(defaultErrorMessageResolver.setI18nFileRootPath).to.not.equal(undefined);
        });
      });

      describe('setCulture', function () {
        afterEach(function () {
          //$httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return with calling the loadingFn if the culture is already loaded', function (done) {
          var loadingFnCalled = false,
            loadingFn = function () {
              var defer = $q.defer();
              loadingFnCalled = true;
              defer.resolve({});
              return defer.promise;
            };

          defaultErrorMessageResolver.setCulture('default', loadingFn).then(function () {
            expect(loadingFnCalled).to.equal(false);
            done();
          });

          $rootScope.$apply();
        });

        it('should call the loading function if it is specified', function (done) {
          var loadingFnCalled = false,
            loadingFn = function () {
              var defer = $q.defer();
              loadingFnCalled = true;
              defer.resolve({});
              return defer.promise;
            };

          defaultErrorMessageResolver.setCulture('fr-fr', loadingFn).then(function () {
            expect(loadingFnCalled).to.equal(true);
            done();
          });

          $rootScope.$apply();
        });

        it('should call $http to load the culture file with the correct url', function (done) {
          $httpBackend.expectGET('js/angular-auto-validate/dist/lang/jcs-auto-validate_fr-fr.json').respond(200, {});

          defaultErrorMessageResolver.setCulture('fr-fr').then(function () {
            done();
          });

          $httpBackend.flush();

          $rootScope.$apply();
        });

        it('should call $http to load the culture file with the correct url by lower casing the culture code', function (done) {
          $httpBackend.expectGET('js/angular-auto-validate/dist/lang/jcs-auto-validate_en-es.json').respond(200, {});

          defaultErrorMessageResolver.setCulture('en-ES').then(function () {
            done();
          });

          $httpBackend.flush();

          $rootScope.$apply();
        });

        it('should return the error in the promise when the load of a remote culture file fails', function (done) {
          $httpBackend.expectGET('js/angular-auto-validate/dist/lang/jcs-auto-validate_en-it.json').respond(404, {
            data: 'some error'
          });

          defaultErrorMessageResolver.setCulture('en-it').then(function () {}, function (err) {
            done();
            expect(err.data).to.equal('some error');
          });

          $httpBackend.flush();

          $rootScope.$apply();
        });

        it('should call $http with the correct url path when the root has been set', function (done) {
          $httpBackend.expectGET('some/made/up/path/jcs-auto-validate_zh-cn.json').respond(200, {});

          defaultErrorMessageResolver.setI18nFileRootPath('some/made/up/path');

          defaultErrorMessageResolver.setCulture('zh-cn').then(function () {
            done();
          });

          $httpBackend.flush();

          $rootScope.$apply();
        });

        it('should resolve the current waiting error message once the culture has been loaded.', function (done) {
          var requiredStr = 'required';
          $httpBackend.expectGET('js/angular-auto-validate/dist/lang/jcs-auto-validate_en-fr.json').respond(200, {
            required: requiredStr
          });

          defaultErrorMessageResolver.setCulture('en-fr');
          defaultErrorMessageResolver.resolve('required').then(function (msg) {
            expect(msg).to.equal(requiredStr);
            done();
          });

          $httpBackend.flush();

          $rootScope.$apply();
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

        it('should replace parameters in error message if element is passed has ng-* attribute of errorType', function (done) {
          var errorType = 'minlength',
            element = angular.element('<input type="text" ng-minlength="2" />');
          defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
            expect(msg).to.equal('Please enter at least 2 characters');
            done();
          });

          $rootScope.$apply();
        });

        it('should default to the ng-* version of the attribute when replacing parameters in the meesage', function (done) {
          var errorType = 'max',
            element = angular.element('<input type="number" ng-max="2" max="2147483647" />');
          defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
            expect(msg).to.equal('Please enter the maximum number of 2');
            done();
          });

          $rootScope.$apply();
        });

        it('should return an overridden error message type if the attribute is present on the element and contains the correct key', function (done) {
          var errorType = 'minlength',
            element = angular.element('<input type="text" data-ng-minlength="2" ng-minlength-err-type="required" />');
          defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
            expect(msg).to.equal('This field is required');
            done();
          });

          $rootScope.$apply();
        });

        it('should replace parameters in error message if element is is overriding the error message type and using a parameter for the overridden errorType', function (done) {
          var errorType = 'minlength',
            element = angular.element('<input type="text" ng-minlength="3" ng-minlength-err-type="max"/>');
          defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
            expect(msg).to.equal('Please enter the maximum number of 3');
            done();
          });

          $rootScope.$apply();
        });

        it('should return the overridden errorType for a custom validation type', function (done) {
          var errorType = 'validator',
            errorMessage = 'Please ensure the password you entered match',
            element = angular.element('<input type="password" ng-model="vm.confirmPassword" validator-err-type="invalidPassword_Confirmation" />');

          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            errorMessages.invalidPassword_Confirmation = errorMessage;

            defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
              expect(msg).to.equal(errorMessage);
              done();
            });
          });

          $rootScope.$apply();
        });

        it('should return the overridden errorType for a custom validation type which has invalid quote characters', function (done) {
          var errorType = 'validator',
            errorMessage = 'Please ensure the password you entered match',
            element = angular.element('<input type="password" ng-model="vm.confirmPassword" validator-err-type=“invalidPasswordConfirmation“ />');

          defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            errorMessages.invalidPasswordConfirmation = errorMessage;

            defaultErrorMessageResolver.resolve(errorType, element).then(function (msg) {
              expect(msg).to.equal(errorMessage);
              done();
            });
          });

          $rootScope.$apply();
        });
      });
    });
  });
}(angular, sinon));
