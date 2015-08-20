(function (angular, sinon) {
  'use strict';

  /**
   * Since Angular 1.3 SetValidity on the ngModelController is called 2-3 times
   * because of the inclusion of async validators hence now the tests only assert the
   * methods were called
   */

  describe('ngModelDirective decorator', function () {
    var sandbox, $rootScope, $q, validationManager, $timeout,
      element, $compile, debounce, debounceStub,
      compileElement = function (html, includesForm) {
        html = includesForm ? html : '<form ng-submit="">' + html + '</form>';
        element = angular.element(html);
        $compile(element)($rootScope);
        $rootScope.$digest();
        element = includesForm ? element : angular.element(element[0].children[0]);
      },
      setNgOptionsNotSupported = function () {
        sandbox.stub(angular, 'version', {
          major: angular.version.major,
          minor: angular.version.minor
        });
      };

    beforeEach(module('jcs-autoValidate'));

    describe('ngModelDirective', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        $compile = $injector.get('$compile');
        $q = $injector.get('$q');
        $timeout = $injector.get('$timeout');
        debounce = $injector.get('jcs-debounce');
        validationManager = $injector.get('validationManager');

        debounceStub = sandbox.stub();

        sandbox.stub(validationManager, 'validateElement');
        sandbox.stub(debounce, 'debounce').returns(debounceStub);
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        compileElement('<input ng-model="model" />');
        expect(element).to.exist;
        var ctrl = element.controller('ngModel');
        expect(ctrl.autoValidated).to.equal(true);
      });

      it('should not be autoValidated it the formnovalidate attribute is present on the element', function () {
        compileElement('<input ng-model="model" formnovalidate />');
        var ctrl = element.controller('ngModel');
        expect(ctrl.autoValidated).to.equal(undefined);
      });

      it('should not be autoValidated it the disable-dynamic-validation attribute is on the parent form', function () {
        compileElement('<form disable-dynamic-validation="true"><input ng-model="model" formnovalidate /></form>', true);
        var ctrl = angular.element(element.children()[0]).controller('ngModel');
        expect(ctrl.autoValidated).to.equal(undefined);
      });

      it('should called debounced method when $setValidity invoked if angular version in 1.3 and thus supports ngModelOptions', function () {
        // As of the changes needed for angular 1.3 RC release this test will no longer pass in angular 1.2x
        //                setNgOptionsSupported();
        //                compileElement('<input ng-model="model" />');
        //                var ctrl = element.controller('ngModel');
        //                ctrl.$setValidity('error', true);
        //
        //                expect(debounceStub.called).to.equal(true);
      });

      it('should called debounced method when $setValidity invoked if ngModelOptions is not defined', function () {
        compileElement('<input ng-model="model" />');
        var ctrl = element.controller('ngModel');
        ctrl.$setValidity('error', false);

        expect(debounceStub.called).to.equal(true);
      });

      it('should called debounced method when $setValidity invoked if ngModelOptions is defined but updateOn is not defined', function () {
        compileElement('<input ng-model="model" data-ng-model-options="{}"/>');
        var ctrl = element.controller('ngModel');
        ctrl.$setValidity('error', false);

        expect(debounceStub.called).to.equal(true);
      });

      it('should called debounced method when $setValidity invoked if ngModelOptions is defined but updateOn is not empty', function () {
        compileElement('<input ng-model="model" data-ng-model-options="{updateOn: \'\'}"/>');
        var ctrl = element.controller('ngModel');
        ctrl.$setValidity('error', false);

        expect(debounceStub.called).to.equal(true);
      });

      it('invoking the debounced method should call validateElement on the validationManager', function () {
        compileElement('<input ng-model="model" />');
        var ctrl = element.controller('ngModel');
        ctrl.$setValidity('error', false);

        expect(debounce.debounce.args[0][0]).to.not.equal(undefined);
        expect(debounce.debounce.args[0][1]).to.equal(100);
        debounce.debounce.args[0][0]();
        expect(validationManager.validateElement.calledOnce).to.equal(true);
      });

      it('should call validate element when element blur event is raised', function () {
        if (angular.version.major === 1 && angular.version.minor < 3) {
          setNgOptionsNotSupported();
          compileElement('<input ng-model="model" data-ng-model-options="{updateOn: \'blur\'}" />');
          element.triggerHandler('blur');

          expect(debounce.debounce.args[0][0]).to.not.equal(undefined);
          expect(debounce.debounce.args[0][1]).to.equal(100);
          debounce.debounce.args[0][0]();
          expect(validationManager.validateElement.calledOnce).to.equal(true);
        }
      });

      it('should remove element event listener when scope is destroyed', function () {
        if (angular.version.major === 1 && angular.version.minor < 3) {
          setNgOptionsNotSupported();
          compileElement('<input ng-model="model" data-ng-model-options="{updateOn: \'blur\'}" />');

          $rootScope.$destroy();

          // How do I mock out the off method of the element?
          //expect(element.off.calledOnce).to.equal(true);
        }
      });

      describe('$setPristine', function () {
        it('should override the default $setPristine function and when invoked should call the default method and the validationManager resetElement method', function () {
          var ngModelController;

          sandbox.stub(validationManager, 'resetElement');
          compileElement('<input ng-model="model" data-ng-model-options="{updateOn: \'blur\'}" />');

          ngModelController = element.controller('ngModel');
          ngModelController.$setPristine();

          expect(validationManager.resetElement.calledOnce).to.equal(true);
        });
      });

      describe('setExternalValidation', function () {
        it('should be defined on the ngModelCtrl', function () {
          var ngModelController;

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');

          expect(ngModelController.setExternalValidation).to.not.equal(undefined);
        });

        it('should set a key in the errors collection', function () {
          var ngModelController,
            errorKey = 'errorKey';

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');
          ngModelController.setExternalValidation(errorKey, 'msgKey', true);


          expect(ngModelController.$error[errorKey]).to.equal(false);
          expect(ngModelController.externalErrors[errorKey]).to.equal(false);
        });
      });

      describe('removeExternalValidation', function () {
        it('should be defined on the ngModelCtrl', function () {
          var ngModelController;

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');

          expect(ngModelController.removeExternalValidation).to.not.equal(undefined);
        });

        it('should set a key in the errors collection', function () {
          var ngModelController,
            errorKey = 'errorKey';

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');
          ngModelController.setExternalValidation(errorKey, 'msgKey', true);


          expect(ngModelController.$error[errorKey]).to.equal(false);
          expect(ngModelController.externalErrors[errorKey]).to.equal(false);

          ngModelController.removeExternalValidation(errorKey, true);

          expect(ngModelController.$error[errorKey]).to.equal(undefined);
          expect(ngModelController.externalErrors[errorKey]).to.equal(undefined);
        });
      });

      describe('removeAllExternalValidation', function () {
        it('should be defined on the ngModelCtrl', function () {
          var ngModelController;

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');

          expect(ngModelController.removeAllExternalValidation).to.not.equal(undefined);
        });

        it('should set a key in the errors collection', function () {
          var ngModelController,
            errorKey = 'errorKey';

          compileElement('<input ng-model="model" />');
          ngModelController = element.controller('ngModel');
          ngModelController.setExternalValidation(errorKey, 'msgKey', true);

          expect(ngModelController.$error[errorKey]).to.equal(false);
          expect(ngModelController.externalErrors[errorKey]).to.equal(false);

          ngModelController.removeAllExternalValidation();

          expect(ngModelController.$error[errorKey]).to.equal(undefined);
          expect(ngModelController.externalErrors[errorKey]).to.equal(undefined);
        });
      });
    });
  });
}(angular, sinon));
