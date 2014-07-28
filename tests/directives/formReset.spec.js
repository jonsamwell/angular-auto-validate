(function (document, angular, sinon) {
    'use strict';
    var sandbox, $rootScope, $timeout,
        element, $compile, validationManager,
        compileElement = function (html) {
            element = angular.element(html);
            $compile(element)($rootScope);
            angular.element(document.body).append(element);
            $rootScope.$digest();
        };

    beforeEach(module('jcs-autoValidate'));

    describe('formReset', function () {
        beforeEach(inject(function ($injector) {
            sandbox = sinon.sandbox.create();
            $rootScope = $injector.get('$rootScope');
            $timeout = $injector.get('$timeout');
            $compile = $injector.get('$compile');
            validationManager = $injector.get('validationManager');
        }));

        afterEach(function () {
            sandbox.restore();
        });

        it('should be defined', function () {
            compileElement('<form mame="test"></form>');

            expect(element).to.exist;
        });

        it('should add an event listener to the forms reset event which calls the resetForm on the validationManager', function () {
            sandbox.stub(validationManager, 'resetForm');
            compileElement('<form mame="test"></form>');

            element.triggerHandler('reset');

            expect(validationManager.resetForm.calledOnce).to.equal(true);
        });

        it('should add an event listener to the scope $destroy event', function () {
            sandbox.stub($rootScope, '$on');
            compileElement('<form mame="test"></form>');

            expect($rootScope.$on.calledOnce).to.equal(true);
            expect($rootScope.$on.getCall(0).args[0]).to.equal('$destroy');
        });
    });
}(document, angular, sinon));
