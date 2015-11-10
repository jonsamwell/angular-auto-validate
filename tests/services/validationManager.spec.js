(function (angular, sinon) {
  'use strict';

  describe('jcs-autoValidate validationManager', function () {
    var sandbox, $rootScope, $compile, $q, validator, validationManager, modelCtrl, defer, elementUtils, $anchorScroll,
      setModelCtrl = function () {
        modelCtrl = {
          $parsers: [],
          $formatters: [],
          $name: 'name'
        };
      },
      compileElement = function (html, includesForm) {
        html = includesForm ? html : '<form ng-submit="">' + html + '</form>';
        var element = angular.element(html);
        $compile(element)($rootScope);
        $rootScope.$digest();
        element = includesForm ? element : angular.element(element[0].children[0]);
        return element;
      },
      getDefaultFormOptions = function () {
        var internalFormController = {};
        return {
          forceValidation: false,
          disabled: false,
          validateNonVisibleControls: false,
          validateOnFormSubmit: false,
          internalFormController: internalFormController,
          getFormController: function () {
            return internalFormController;
          }
        };
      };

    beforeEach(module('jcs-autoValidate'));

    describe('validationManager', function () {
      beforeEach(function () {
        sandbox = sinon.sandbox.create();
      });

      beforeEach(module('jcs-autoValidate', function ($provide) {
        $provide.value('$anchorScroll', sandbox.stub());
      }));

      beforeEach(inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        $compile = $injector.get('$compile');
        $q = $injector.get('$q');
        defer = $q.defer();
        validator = $injector.get('validator');
        validationManager = $injector.get('validationManager');
        elementUtils = $injector.get('jcs-elementUtils');
        $anchorScroll = $injector.get('$anchorScroll');

        sandbox.stub(validator, 'makeValid');
        sandbox.stub(validator, 'makeInvalid');
        sandbox.stub(validator, 'getErrorMessage').returns(defer.promise);

        setModelCtrl();
      }));

      afterEach(function () {
        sandbox.restore();
        setModelCtrl();
      });

      it('should be defined', function () {
        expect(validationManager).to.exist;
      });

      describe('validateElement', function () {
        it('should return true if the control is pristine and not make the element valid', function () {
          var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
            result;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$pristine = true;
          result = validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());
          expect(result).to.equal(true);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(false);
        });

        it('should make the element valid and return true if the control is not pristine and has no validation requirements', function () {
          var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
            result;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$pristine = false;
          result = validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());
          expect(result).to.equal(true);
          expect(validator.makeValid.called).to.equal(true);
          expect(validator.makeInvalid.called).to.equal(false);
        });

        it('should not validate the element if it is not visible on the screen', function () {
          var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
            result;

          sandbox.stub(elementUtils, 'isElementVisible').returns(false);
          modelCtrl.$pristine = false;
          result = validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());

          expect(result).to.equal(true);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(false);
        });

        it('should validate the element if it is not visible on the screen as the form option validateNonVisibleControls is true', function () {
          var el = compileElement('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
            result,
            frmOptions = getDefaultFormOptions();

          frmOptions.validateNonVisibleControls = true;
          sandbox.stub(elementUtils, 'isElementVisible').returns(false);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$errors = {
            required: true
          };
          result = validationManager.validateElement(modelCtrl, el, frmOptions);

          defer.resolve('error message');
          $rootScope.$apply();

          expect(result).to.equal(false);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(true);
        });

        it('should validate the element regardless of whether there is a parent form', function () {
          var el = compileElement('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>', true),
            result,
            frmOptions = getDefaultFormOptions();

          frmOptions.validateNonVisibleControls = true;
          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$errors = {
            required: true
          };
          result = validationManager.validateElement(modelCtrl, el, frmOptions);

          defer.resolve('error message');
          $rootScope.$apply();

          expect(result).to.equal(false);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(true);
        });

        it('should not validate the element if validateOnSubmit is true and the form has not been submitted yet', function () {
          var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
            result;

          var formOptions = getDefaultFormOptions();
          formOptions.internalFormController.$submitted = false;
          formOptions.validateOnFormSubmit = true;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$pristine = false;
          result = validationManager.validateElement(modelCtrl, el, formOptions);

          expect(result).to.equal(true);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(false);
        });

        it('should validate the element if validateOnSubmit is true and the form has been submitted', function () {
          var el = angular.element('<input type="text" ng-model="propOne"/>'),
            result;

          var formOptions = getDefaultFormOptions();
          formOptions.internalFormController.$submitted = true;
          formOptions.validateOnFormSubmit = true;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          defer.resolve('error message');

          modelCtrl.$parsers.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$error = {
            required: true
          };

          result = validationManager.validateElement(modelCtrl, el, formOptions);

          $rootScope.$apply();

          expect(result).to.equal(false);
          expect(validator.makeValid.called).to.equal(false);
          expect(validator.makeInvalid.called).to.equal(true);
        });

        it('should call validator to make element valid when there are $formatters and the form is valid', function () {
          var el = angular.element('<input type="text" ng-model="propOne"/>');

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$formatters.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = false;

          validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());
          expect(validator.makeValid.calledOnce).to.equal(true);
          expect(validator.makeValid.calledWith(el)).to.equal(true);
        });

        it('should call validator to make element invalid when there are $formatters and the form is invalid', function () {
          var el = angular.element('<input type="text" ng-model="propOne" />'),
            errorMsg = 'msg';

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$formatters.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$error = {
            required: true
          };

          defer.resolve(errorMsg);
          validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());

          $rootScope.$apply();

          expect(validator.makeInvalid.calledOnce).to.equal(true);
          expect(validator.makeInvalid.calledWith(el, errorMsg)).to.equal(true);
        });

        it('should call validator to make element invalid when there are $parsers and the form is invalid', function () {
          var el = angular.element('<input type="text" ng-model="propOne"/>'),
            errorMsg = 'msg';

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$parsers.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$error = {
            required: true
          };

          defer.resolve(errorMsg);
          validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());

          $rootScope.$apply();

          expect(validator.makeInvalid.calledOnce).to.equal(true);
          expect(validator.makeInvalid.calledWith(el, errorMsg)).to.equal(true);
        });

        it('should return true if the input has no validation specified', function () {
          var el = angular.element('<input type="text" ng-model="propertyOne" />'),
            result;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          result = validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());

          expect(result).to.equal(true);
        });

        it('should call validator to make element valid if the control is marked as a custom form control', function () {
          var el = angular.element('<div type="text" ng-model="propOne" register-custom-form-control=""></div>');

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$formatters.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = false;

          validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());
          expect(validator.makeValid.calledOnce).to.equal(true);
          expect(validator.makeValid.calledWith(el)).to.equal(true);
        });

        it('should call validator to make element invalid it the control is marked as a custom form control', function () {
          var el = angular.element('<div type="text" ng-model="propOne" register-custom-form-control=""></div>'),
            errorMsg = 'msg';

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          modelCtrl.$formatters.push(angular.noop);
          modelCtrl.$pristine = false;
          modelCtrl.$invalid = true;
          modelCtrl.$error = {
            required: true
          };

          defer.resolve(errorMsg);
          validationManager.validateElement(modelCtrl, el, getDefaultFormOptions());

          $rootScope.$apply();

          expect(validator.makeInvalid.calledOnce).to.equal(true);
          expect(validator.makeInvalid.calledWith(el, errorMsg)).to.equal(true);
        });
      });

      describe('validateForm', function () {
        it('should return false it the form element is undefined', function () {
          var result = validationManager.validateForm();

          expect(result).to.equal(false);
        });

        it('should return true it the form controller is set to not auto validate the form', function () {
          var form = compileElement('<form role="form" novalidate="novalidate" ng-submit="submit();" disable-dynamic-validation><input ng-model="name" required /></form>', true),
            result = validationManager.validateForm(form);

          expect(result).to.equal(true);
        });

        it('should only validate elements on the parent and not disabled subform', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            subFrm = compileElement('<ng-form name="subFrm1" disable-dynamic-validation></ng-form>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            inpt2 = compileElement('<input type="text" ng-model="surname" ng-minlength="2" />', true),
            isValid;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          frm.append(inpt);
          subFrm.append(inpt2);
          inpt.controller('ngModel').$setValidity('minlength', false);
          inpt.controller('ngModel').$pristine = false;
          inpt2.controller('ngModel').$pristine = false;
          inpt2.controller('ngModel').$setValidity('minlength', false);
          frm.append(subFrm);
          $rootScope.$apply();

          defer.resolve('errorMsg');
          isValid = validationManager.validateForm(frm);

          $rootScope.$apply();

          expect(isValid).to.equal(false);
          expect(validator.makeInvalid.calledOnce).to.equal(true);
        });

        it('should only validate elements on the parent and not disabled subform where the subform is via an attribute', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            subFrm = compileElement('<div ng-form name="subFrm1" disable-dynamic-validation></div>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            inpt2 = compileElement('<input type="text" ng-model="surname" ng-minlength="2" />', true),
            isValid;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          frm.append(inpt);
          subFrm.append(inpt2);
          inpt.controller('ngModel').$setValidity('minlength', false);
          inpt.controller('ngModel').$pristine = false;
          inpt2.controller('ngModel').$pristine = false;
          inpt2.controller('ngModel').$setValidity('minlength', false);
          frm.append(subFrm);
          $rootScope.$apply();

          defer.resolve('errorMsg');
          isValid = validationManager.validateForm(frm);

          $rootScope.$apply();

          expect(isValid).to.equal(false);
          expect(validator.makeInvalid.calledOnce).to.equal(true);
        });

        it('should call validator makeInvalid once when a single form input element is invalid', function () {
          var frm = compileElement('<form name="frm1"></form>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            isValid;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          frm.append(inpt);
          inpt.controller('ngModel').$setValidity('minlength', false);
          inpt.controller('ngModel').$pristine = false;

          $rootScope.$apply();

          defer.resolve('errorMsg');
          isValid = validationManager.validateForm(frm);

          $rootScope.$apply();

          expect(isValid).to.equal(false);
          expect(validator.makeInvalid.calledOnce).to.equal(true);
        });

        it('should call validator makeInvalid twice when a single form input element is invalid', function () {
          var frm = compileElement('<form name="frm1"></form>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            inpt2 = compileElement('<input type="text" ng-model="name" ng-maxlength="2" />', true),
            isValid;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          frm.append(inpt);
          frm.append(inpt2);
          inpt.controller('ngModel').$setValidity('minlength', false);
          inpt.controller('ngModel').$pristine = false;
          inpt2.controller('ngModel').$setValidity('maxlength', false);
          inpt2.controller('ngModel').$pristine = false;
          $rootScope.$apply();

          defer.resolve('errorMsg');
          isValid = validationManager.validateForm(frm);

          $rootScope.$apply();

          expect(isValid).to.equal(false);
          expect(validator.makeInvalid.calledTwice).to.equal(true);
        });

        it('should call validator makeInvalid once when a single form input element is invalid in a child ng-form', function () {
          var frm = compileElement('<form name="frm1"></form>', true),
            ngFrm = compileElement('<ng-form name="childFrm"></ng-form>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            isValid;

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          ngFrm.append(inpt);
          frm.append(ngFrm);
          inpt.controller('ngModel').$setValidity('minlength', false);
          inpt.controller('ngModel').$pristine = false;
          $rootScope.$apply();

          defer.resolve('errorMsg');
          isValid = validationManager.validateForm(frm);

          $rootScope.$apply();

          expect(isValid).to.equal(false);
          expect(validator.makeInvalid.calledOnce).to.equal(true);
        });

        it('should call validator makeInvalid once when a single form input element is invalid and the form is submitted', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            inpt = compileElement('<input type="text" ng-model="name" required="required" ng-minlength="2" />', true);

          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          frm.append(inpt);
          $rootScope.$apply();

          frm.on('submit', function (event) {
            event.preventDefault();
          });

          defer.resolve('errorMsg');
          frm.trigger('submit');

          $rootScope.$apply();

          expect(validator.makeInvalid.calledOnce).to.equal(true);
        });

        it('should call $anchorScroll to first invalid element when the option is disabled', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            inpt = compileElement('<input type="text" ng-model="name" required="required" ng-minlength="2" />', true);


          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          sandbox.stub(validator, 'firstInvalidElementScrollingOnSubmitEnabled').returns(false);
          frm.append(inpt);
          $rootScope.$apply();

          frm.on('submit', function (event) {
            event.preventDefault();
          });

          defer.resolve('errorMsg');
          frm.trigger('submit');

          $rootScope.$apply();

          expect($anchorScroll.notCalled).to.equal(true);
        });

        it('should call $anchorScroll with first invalid element id when the option is enabled', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            firstInpt = compileElement('<input type="text" id="first" ng-model="name" required="required" ng-minlength="2" />', true),
            secondInpt = compileElement('<input type="text" id="second" ng-model="description" required="required" ng-minlength="2" />', true);


          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          sandbox.stub(validator, 'firstInvalidElementScrollingOnSubmitEnabled').returns(true);
          frm.append(firstInpt);
          frm.append(secondInpt);
          $rootScope.$apply();

          frm.on('submit', function (event) {
            event.preventDefault();
          });

          defer.resolve('errorMsg');
          frm.trigger('submit');

          $rootScope.$apply();

          expect($anchorScroll.calledOnce).to.equal(true);
          expect($anchorScroll.calledWith('first')).to.equal(true);
        });

        it('should not call $anchorScroll with an undefined id', function () {
          var frm = compileElement('<form name="frm1" ng-submit=""></form>', true),
            firstInpt = compileElement('<input type="text" ng-model="name" required="required" ng-minlength="2" />', true);


          sandbox.stub(elementUtils, 'isElementVisible').returns(true);
          sandbox.stub(validator, 'firstInvalidElementScrollingOnSubmitEnabled').returns(true);
          frm.append(firstInpt);
          $rootScope.$apply();

          frm.on('submit', function (event) {
            event.preventDefault();
          });

          defer.resolve('errorMsg');
          frm.trigger('submit');

          $rootScope.$apply();

          expect($anchorScroll.notCalled).to.equal(true);
        });
      });

      describe('resetForm', function () {
        it('should call validator.makeDefault for every input type element in the form', function () {
          var frm = compileElement('<form name="frm1"><input type="text" ng-model="name" ng-minlength="2" /><input type="text" ng-model="lastname" ng-maxlength="2" /></form>', true);
          sandbox.stub(validator, 'makeDefault');

          $rootScope.$apply();

          validationManager.resetForm(frm);

          $rootScope.$apply();

          expect(validator.makeDefault.calledTwice).to.equal(true);
        });

        it('should call validator makeDefault once when a single form input element is invalid in a child ng-form', function () {
          var frm = compileElement('<form name="frm1"><ng-form name="childFrm"><input type="text" ng-model="name" ng-minlength="2" /></ng-form></form>', true);
          sandbox.stub(validator, 'makeDefault');

          $rootScope.$apply();

          validationManager.resetForm(frm);

          $rootScope.$apply();

          expect(validator.makeDefault.calledOnce).to.equal(true);
        });

        it('should set the model controller of the input element to pristine', function () {
          var frm = compileElement('<form name="frm1"></form>', true),
            ngFrm = compileElement('<ng-form name="childFrm"></ng-form>', true),
            inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />', true),
            inptNgModelController = inpt.controller('ngModel');

          sandbox.stub(validator, 'makeDefault');

          ngFrm.append(inpt);
          frm.append(ngFrm);
          $rootScope.$apply();

          inptNgModelController.$setViewValue('123');
          $rootScope.$apply();
          expect(inptNgModelController.$pristine).to.equal(false);

          validationManager.resetForm(frm);

          $rootScope.$apply();

          expect(inptNgModelController.$pristine).to.equal(true);
        });
      });

      describe('resetElement', function () {
        it('should call validator.makeDefault with the given element', function () {
          var inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />');

          sandbox.stub(validator, 'makeDefault');

          $rootScope.$apply();

          validationManager.resetElement(inpt);

          $rootScope.$apply();

          expect(validator.makeDefault.calledOnce).to.equal(true);
        });
      });
    });
  });
}(angular, sinon));
