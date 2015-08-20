(function (window, angular, sinon) {
  'use strict';

  describe('ngModelDirective decorator', function () {
    var sandbox, $rootScope, $q, validationManager,
      element, $compile, submitFnCalled = false,
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
        validationManager = $injector.get('validationManager');

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

      it('should not call the submit function on ngSubmit when the form is submitted and is valid', function () {
        sandbox.stub(validationManager, 'validateForm').returns(false);
        compileElement('<form name="frmOne" ng-submit="submitFn()"><input type="text" ng-model="name"/></form>');
        expect(element).to.exist;

        window.browserTrigger(element, 'submit');
        $rootScope.$apply();

        expect(submitFnCalled).to.equal(false);
      });
    });
  });
}(window, angular, sinon));
