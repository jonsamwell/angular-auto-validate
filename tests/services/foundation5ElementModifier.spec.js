(function (angular, sinon) {
  'use strict';

  describe('angulartemplates.modules.form foundation5ElementModifier', function () {
    var sandbox, $rootScope, foundation5ElementModifier;

    beforeEach(module('jcs-autoValidate'));

    describe('foundation5ElementModifier', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        foundation5ElementModifier = $injector.get('foundation5ElementModifier');
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        expect(foundation5ElementModifier).to.not.equal(undefined);
      });

      describe('makeDefault', function () {
        /**
         * Foundation allows the .error class to be on either the element or the parent .column element.
         */

        it('should remove the error class from the input', function () {
          var element = angular.element('<input type="text" class="error"/>');
          foundation5ElementModifier.makeDefault(element);

          expect(element.hasClass('error')).to.equal(false);
        });

        it('should remove the error class from the parent element with .columns class', function () {
          var element = angular.element('<div class="columns error"><input type="text" /></div>');
          foundation5ElementModifier.makeDefault(element);

          expect(element.hasClass('error')).to.equal(false);
        });

        it('should remove the error class from the parent element with .column class', function () {
          var element = angular.element('<div class="column error"><input type="text" /></div>');
          foundation5ElementModifier.makeDefault(element);

          expect(element.hasClass('error')).to.equal(false);
        });

        it('should remove the small.error element from the parent element with .columns class', function () {
          var element = angular.element('<div class="columns error"><input type="text" /><small class="error">error text</small></div>');
          foundation5ElementModifier.makeDefault(element);

          expect(element.find('small.error').length).to.equal(0);
        });
      });

      describe('makeValid', function () {
        /**
         * Foundation allows the .error class to be on either the element or the parent .column element.
         */

        it('should remove the error class from the input', function () {
          var element = angular.element('<input type="text" class="error"/>');
          foundation5ElementModifier.makeValid(element);

          expect(element.hasClass('error')).to.equal(false);
        });

        it('should remove the error class from the parent element with .columns class', function () {
          var element = angular.element('<div class="columns error"><input type="text" /></div>');
          foundation5ElementModifier.makeValid(element);

          expect(element.hasClass('error')).to.equal(false);
        });

        it('should remove the small.error element from the parent element with .columns class', function () {
          var element = angular.element('<div class="columns error"><input type="text" /><small class="error">error text</small></div>');
          foundation5ElementModifier.makeValid(element);

          expect(element.find('small.error').length).to.equal(0);
        });
      });

      describe('makeInvalid', function () {
        /**
         * Foundation allows the .error class to be on either the element or the parent .column element.
         */

        it('should add the error class to the input element', function () {
          var element = angular.element('<input type="text" />');
          foundation5ElementModifier.makeInvalid(element);

          expect(element.hasClass('error')).to.equal(true);
        });

        it('should add the error class to the parent element with .columns class', function () {
          var element = angular.element('<div class="columns"><input type="text" /></div>');
          foundation5ElementModifier.makeInvalid(element);

          expect(element.hasClass('error')).to.equal(true);
        });

        it('should add the small.error element to the parent element with .columns class', function () {
          var element = angular.element('<div class="columns"><input type="text" /></div>');
          foundation5ElementModifier.makeInvalid(element);

          expect(element.find('small.error').length).to.equal(1);
        });
      });
    });
  });
}(angular, sinon));
