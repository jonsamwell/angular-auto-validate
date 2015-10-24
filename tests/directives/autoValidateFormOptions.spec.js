(function (document, angular, sinon) {
  'use strict';
  var sandbox, $rootScope,
    element, $compile, validator,
    compileElement = function (html) {
      element = angular.element(html);
      $compile(element)($rootScope);
      $rootScope.$digest();
    };

  beforeEach(module('jcs-autoValidate'));

  describe('autoValidateFormOptions', function () {
    beforeEach(inject(function ($injector) {
      sandbox = sinon.sandbox.create();
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      validator = $injector.get('validator');
    }));

    afterEach(function () {
      sandbox.restore();
    });

    it('should be defined', function () {
      compileElement('<form name="test""></form>');

      expect(element.controller('form').autoValidateFormOptions).to.exist;
    });

    describe('disableDynamicValidation', function () {
      it('should set the default value if config properties are not on form', function () {
        sandbox.stub(validator, 'defaultFormValidationOptions', {
          validateNonVisibleControls: 2,
          removeExternalValidationErrorsOnSubmit: 3,
          validateOnFormSubmit: 4
        });

        compileElement('<form name="test"></form>');
        var controller = element.controller('form');
        expect(controller.autoValidateFormOptions.validateNonVisibleControls).to.equal(2);
        expect(controller.autoValidateFormOptions.removeExternalValidationErrorsOnSubmit).to.equal(3);
        expect(controller.autoValidateFormOptions.validateOnFormSubmit).to.equal(4);
      });

      it('should set the property "disableDynamicValidation" on the form controller to true', function () {
        compileElement('<form name="test" disable-dynamic-validation="true"></form>');
        var controller = element.controller('form');
        expect(controller.autoValidateFormOptions.disabled).to.equal(true);
      });

      it('should set the property "disableDynamicValidation" on the form controller to true', function () {
        compileElement('<form name="test" data-disable-dynamic-validation="true"></form>');
        var controller = element.controller('form');
        expect(controller.autoValidateFormOptions.disabled).to.equal(true);
      });

      it('should set the property "disableDynamicValidation" on the form controller to true if it is used as a boolean attribute', function () {
        compileElement('<form name="test" disable-dynamic-validation></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(true);
      });

      it('should set the property "disableDynamicValidation" on the form controller to false', function () {
        compileElement('<form name="test" disable-dynamic-validation="false"></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(false);
      });

      it('should set the property "disableDynamicValidation" on the form controller to false when validator is disabled', function () {
        sandbox.stub(validator, 'isEnabled').returns(false);
        compileElement('<form name="test" disable-dynamic-validation="false"></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(false);
      });

      it('should set the property "disableDynamicValidation" on the form controller to false if the attribute is not there', function () {
        compileElement('<form name="test"></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(false);
      });

      it('should set the property "disableDynamicValidation" on the form controller to true if the library is disabled', function () {
        validator.enable(false);
        compileElement('<form name="test"></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(true);
        validator.enable(true);
      });

      it('should set the property "disableDynamicValidation" on the form controller to false if the library is disabled but the form is enabled', function () {
        validator.enable(false);
        compileElement('<form name="test" disable-dynamic-validation="false"></form>');

        expect(element.controller('form').autoValidateFormOptions.disabled).to.equal(false);
        validator.enable(true);
      });
    });

    describe('validateNonVisibleControls', function () {
      it('should set the property "validateNonVisibleControls" on the form controller to true', function () {
        compileElement('<form name="test" validate-non-visible-controls="true"></form>');
        var controller = element.controller('form');
        expect(controller.autoValidateFormOptions.validateNonVisibleControls).to.equal(true);
      });

      it('should set the property "validateNonVisibleControls" on the form controller to true', function () {
        compileElement('<form name="test" validate-non-visible-controls="true"></form>');
        var controller = element.controller('form');
        expect(controller.autoValidateFormOptions.validateNonVisibleControls).to.equal(true);
      });

      it('should set the property "validateNonVisibleControls" on the form controller to true if it is used as a boolean attribute', function () {
        compileElement('<form name="test" validate-non-visible-controls></form>');

        expect(element.controller('form').autoValidateFormOptions.validateNonVisibleControls).to.equal(true);
      });

      it('should set the property "validateNonVisibleControls" on the form controller to false', function () {
        compileElement('<form name="test" validate-non-visible-controls="false"></form>');

        expect(element.controller('form').autoValidateFormOptions.validateNonVisibleControls).to.equal(false);
      });

      it('should set the property "validateNonVisibleControls" on the form controller to false if the attribute is not there', function () {
        compileElement('<form name="test"></form>');

        expect(element.controller('form').autoValidateFormOptions.validateNonVisibleControls).to.equal(false);
      });

      it('should be serializable', function () {
        compileElement('<form name="test"><input ng-model="name" required /></form>');

        expect(angular.toJson(element.controller('form'))).to.not.equal(undefined);
      });
    });
  });
}(document, angular, sinon));
