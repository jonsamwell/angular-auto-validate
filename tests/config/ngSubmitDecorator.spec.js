(function (window, angular, sinon) {
    'use strict';

    describe('ngModelDirective decorator', function () {
        var sandbox, $rootScope, $q, $compile,
            validator, validationManager, elementUtils,
            element,
            submitFnCalled = false,
            compileElement = function (html) {
                element = angular.element(html);
                $compile(element)($rootScope);
                $rootScope.$digest();
            };

        beforeEach(module('jcs-autoValidate'));

        describe('ngSubmitDirective', function () {
            beforeEach(inject(function ($injector) {
                sandbox = sinon.sandbox.create();
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $q = $injector.get('$q');
                validator = $injector.get('validator');
                validationManager = $injector.get('validationManager');
                elementUtils = $injector.get('jcs-elementUtils');

                $rootScope.submitFn = function () {
                    submitFnCalled = true;
                };
            }));

            afterEach(function () {
                submitFnCalled = false;
                sandbox.restore();
            });

            it('should be defined', function () {
                compileElement('<form name="frmOne" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;
            });

            it('should call validate form on the validationManager when the form submit event is raised', function () {
                sandbox.stub(validationManager, 'validateForm').returns(true);
                compileElement('<form name="frmOne" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;

                window.browserTrigger(element, 'submit');

                expect(validationManager.validateForm.calledOnce).to.equal(true);
            });

            it('should call the submit function on ngSubmit when the form is submitted and is valid', function () {
                sandbox.stub(validationManager, 'validateForm').returns(true);
                compileElement('<form name="frmOne2" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;

                window.browserTrigger(element, 'submit');
                $rootScope.$apply();

                expect(submitFnCalled).to.equal(true);
            });

            it('should call the submit function on ngSubmit when the form is submitted, is invalid but the ngSubmitForce attribute is true', function () {
                sandbox.stub(validationManager, 'validateForm').returns(false);
                compileElement('<form name="frmOne2" ng-submit="submitFn()" ng-submit-force="true"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;

                window.browserTrigger(element, 'submit');
                $rootScope.$apply();

                expect(submitFnCalled).to.equal(true);
            });

            it('should not call the submit function on ngSubmit when the form is submitted and is invalid', function () {
                sandbox.stub(validationManager, 'validateForm').returns(false);
                compileElement('<form name="frmOne" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;

                window.browserTrigger(element, 'submit');
                $rootScope.$apply();

                expect(submitFnCalled).to.equal(false);
            });

            it('should call the submit function on ngSubmit when the form is invalid but has only allowed errors', function () {
                validator.defaultFormValidationOptions.errorsAllowedOnSubmit = ['required', 'minlength'];
                sandbox.stub(validationManager, 'validateForm').returns(false);
                sandbox.stub(elementUtils, 'hasErrorsOtherThanExcluded').returns(false);

                compileElement('<form name="frmOne" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
                expect(element).to.exist;

                window.browserTrigger(element, 'submit');
                $rootScope.$apply();

                expect(submitFnCalled).to.equal(true);
            });
        });
    });
}(window, angular, sinon));
