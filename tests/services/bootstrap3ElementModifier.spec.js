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

            describe('makeValid', function () {
                it('should remove the .has-error class and add the .has-success and .has-feedback classes', function () {
                    var element = angular.element('<div class="form-group has-error"><input type="text"/></div>');

                    bootstrap3ElementModifier.makeValid(element);

                    expect(element.hasClass('has-error')).to.equal(false);
                    expect(element.hasClass('has-success')).to.equal(true);
                    expect(element.hasClass('has-feedback')).to.equal(true);
                });

                it('should add an OK icon when property "addValidationStateIcons" is true', function () {
                    var element = angular.element('<div class="form-group has-error"><input type="text"/></div>');
                    bootstrap3ElementModifier.enableValidationStateIcons(true);

                    bootstrap3ElementModifier.makeValid(element);

                    expect(element.find('.glyphicon.glyphicon-ok.form-control-feedback').length).to.equal(1);
                });

                it('should remove the .error-msg element', function () {
                    var element = angular.element('<div class="form-group has-error"><input type="text"/><span class="help-text error-msg">help text</span></div>');
                    bootstrap3ElementModifier.enableValidationStateIcons(true);

                    bootstrap3ElementModifier.makeValid(element);

                    expect(element.find('.help-text').length).to.equal(0);
                });
            });

            describe('makeInvalid', function () {
                it('should remove the .has-success class and add the .has-error and .has-feedback classes', function () {
                    var element = angular.element('<div class="form-group has-success"><input type="text"/></div>');

                    bootstrap3ElementModifier.makeInvalid(element);

                    expect(element.hasClass('has-success')).to.equal(false);
                    expect(element.hasClass('has-error')).to.equal(true);
                    expect(element.hasClass('has-feedback')).to.equal(true);
                });

                it('should add an error icon when property "addValidationStateIcons" is true', function () {
                    var element = angular.element('<div class="form-group has-success"><input type="text"/></div>');
                    bootstrap3ElementModifier.enableValidationStateIcons(true);

                    bootstrap3ElementModifier.makeInvalid(element);

                    expect(element.find('.glyphicon.glyphicon-remove.form-control-feedback').length).to.equal(1);
                });

                it('should add the .help-text element', function () {
                    var element = angular.element('<div class="form-group"><input type="text"/></div>');
                    bootstrap3ElementModifier.enableValidationStateIcons(true);

                    bootstrap3ElementModifier.makeInvalid(element);

                    expect(element.find('.help-text').length).to.equal(1);
                });
            });
        });
    });
}(angular, sinon));
