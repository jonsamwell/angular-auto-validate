(function (angular, sinon) {
  'use strict';

  describe('jcs.autoValidate bootstrap3ElementModifier', function () {
    var sandbox, $rootScope, bootstrap3ElementModifier;

    beforeEach(module('jcs-autoValidate'));

    describe('bootstrap3ElementModifier', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        bootstrap3ElementModifier = $injector.get('bootstrap3ElementModifier');
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        expect(bootstrap3ElementModifier).to.not.equal(undefined);
      });

      describe('makeDefault', function () {
        it('should remove the .has-error class, .has-success and .has-feedback classes', function () {
          var element = angular.element('<div class="form-group has-error has-success has-feedback"><input type="text"/></div>');

          bootstrap3ElementModifier.makeDefault(element);

          expect(element.hasClass('has-error')).to.equal(false);
          expect(element.hasClass('has-success')).to.equal(false);
          expect(element.hasClass('has-feedback')).to.equal(false);
        });

        it('should remove the .error-msg element', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el9" type="email" class="form-control" required="required" ng-model="model.email"><span class="help-block error-msg">help text</span></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);


          bootstrap3ElementModifier.makeDefault(element.find('#el9'));

          expect(element.find('.help-block').length).to.equal(0);
        });
      });

      describe('makeInvalid', function () {
        it('should remove the .has-success class and add the .has-error and .has-feedback classes', function () {
          var element = angular.element('<div class="form-group has-success"><input type="text"/></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);
          bootstrap3ElementModifier.makeInvalid(element);

          expect(element.hasClass('has-success')).to.equal(false);
          expect(element.hasClass('has-error')).to.equal(true);
          expect(element.hasClass('has-feedback')).to.equal(true);
        });

        it('should add an error icon when property "addValidationStateIcons" is true', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el3" type="email" class="form-control" required="required" ng-model="model.email"></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);

          bootstrap3ElementModifier.makeInvalid(element.find('#el3'));

          expect(element.find('.glyphicon.glyphicon-remove.form-control-feedback').length).to.equal(1);
        });

        it('should add the .help-block element', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el4" type="email" class="form-control" required="required" ng-model="model.email"></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);

          bootstrap3ElementModifier.makeInvalid(element.find('#el4'));

          expect(element.find('.help-block').length).to.equal(1);
        });

        it('should handle checkbox with a label correctly', function () {
          var element = angular.element('<div class="form-group"><label>' +
            '<input id="el5" type="checkbox" class="form-control" required="required" ng-model="model.hasEmail">Label Value</label></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);
          bootstrap3ElementModifier.makeInvalid(element.find('#el5'));
          $rootScope.$apply();

          expect(element[0].outerHTML).to.equal('<div class="form-group has-error has-feedback"><label>' +
            '<input id="el5" type="checkbox" class="form-control" required="required" ng-model="model.hasEmail">Label Value</label>' +
            '<span class="glyphicon glyphicon-remove form-control-feedback"></span><span class="help-block has-error error-msg">undefined</span></div>');
        });
      });

      describe('makeValid', function () {
        it('should remove the .has-error class and add the .has-success and .has-feedback classes', function () {
          var element = angular.element('<div class="form-group has-error"><input type="text"/></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);

          bootstrap3ElementModifier.makeValid(element);

          expect(element.hasClass('has-error')).to.equal(false);
          expect(element.hasClass('has-success')).to.equal(true);
          expect(element.hasClass('has-feedback')).to.equal(true);
        });

        it('should add an OK icon when property "addValidationStateIcons" is true', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el1" type="email" class="form-control" required="required" ng-model="model.email"></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);

          bootstrap3ElementModifier.makeValid(element.find('#el1'));

          expect(element.find('.glyphicon.glyphicon-ok.form-control-feedback').length).to.equal(1);
        });

        it('should add the has-feedback class', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el3" type="email" class="form-control" required="required" ng-model="model.email"><span class="help-block error-msg">help text</span></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(true);


          bootstrap3ElementModifier.makeValid(element.find('#el3'));

          expect(element.hasClass('has-feedback')).to.equal(true);
        });

        it('should not add the has-feedback class', function () {
          var element = angular.element('<div class="form-group"><div class="col-sm-10">' +
            '<input id="el4" type="email" class="form-control" required="required" ng-model="model.email"><span class="help-block error-msg">help text</span></div></div>');
          bootstrap3ElementModifier.enableValidationStateIcons(false);

          bootstrap3ElementModifier.makeValid(element.find('#el4'));

          expect(element.hasClass('has-feedback')).to.equal(false);
        });
      });
    });
  });
}(angular, sinon));
