(function (angular, sinon) {
  'use strict';

  describe('jcs.autoValidate debounce', function () {
    var sandbox, $rootScope, $timeout, debounce;

    beforeEach(module('jcs-autoValidate'));

    describe('bootstrap3ElementModifier', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        $timeout = $injector.get('$timeout');
        debounce = $injector.get('jcs-debounce');
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        expect(debounce).to.not.equal(undefined);
      });

      describe('debounce', function () {
        it('should return a function', function () {
          var debouceFn = debounce.debounce(angular.noop);

          expect(typeof debouceFn === 'function').to.equal(true);
        });

        it('should execute immediately with a specified timeout', function () {
          var debouceFnCalledTimes = 0,
            debouceFn = debounce.debounce(function () {
              debouceFnCalledTimes += 1;
            });

          debouceFn();

          $timeout.flush();

          expect(debouceFnCalledTimes).to.equal(1);
        });

        it('should only execute once when called multiple times', function () {
          var debouceFnCalledTimes = 0,
            debouceFn = debounce.debounce(function () {
              debouceFnCalledTimes += 1;
            }, 100);

          debouceFn();
          debouceFn();
          debouceFn();
          debouceFn();

          $timeout.flush();

          expect(debouceFnCalledTimes).to.equal(1);
        });
      });
    });
  });
}(angular, sinon));
