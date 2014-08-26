(function (document, angular, sinon) {
    'use strict';
    var sandbox, $rootScope,
        element, $compile,
        compileElement = function (html) {
            element = angular.element(html);
            $compile(element)($rootScope);
            $rootScope.$digest();
        };

    beforeEach(module('jcs-autoValidate'));

    describe('disableDynamicValidation', function () {
        beforeEach(inject(function ($injector) {
            sandbox = sinon.sandbox.create();
            $rootScope = $injector.get('$rootScope');
            $compile = $injector.get('$compile');
        }));

        afterEach(function () {
            sandbox.restore();
        });

        it('should be defined', function () {
            compileElement('<form mame="test" disable-dynamic-validation></form>');

            expect(element).to.exist;
        });

        it('should set the property "disableDynamicValidation" on the form controller to false', function () {
            compileElement('<form mame="test" disable-dynamic-validation></form>');

            expect(element.controller('form').disableDynamicValidation).to.equal(true);
        });
    });
}(document, angular, sinon));
