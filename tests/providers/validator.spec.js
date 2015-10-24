(function (angular, sinon) {
  'use strict';
  describe('jcs-autoValidator validator', function () {
    var sandbox, $rootScope, $q, validator;

    beforeEach(module('jcs-autoValidate'));

    describe('validator', function () {
      beforeEach(inject(function ($injector) {
        sandbox = sinon.sandbox.create();
        $rootScope = $injector.get('$rootScope');
        $q = $injector.get('$q');
        validator = $injector.get('validator');
      }));

      afterEach(function () {
        sandbox.restore();
      });

      it('should be defined', function () {
        expect(validator).to.exist;
      });

      describe('setDefaultElementModifier', function () {
        it('should throw an error when a default modifier is set which does not exist', function () {
          expect(function () {
            validator.setDefaultElementModifier('missing_key');
          }).to.throws(Error, 'Element modifier not registered: missing_key');
        });

        it('should set default dom modifier when modifier is present', function () {
          var key = 'key';
          validator.registerDomModifier(key, {});
          expect(function () {
            validator.setDefaultElementModifier(key);
          }).to.not.throws(Error);
          expect(validator.defaultElementModifier).to.equal(key);
        });
      });

      describe('getErrorMessage', function () {
        it('should throw an error an error message resolver has not been set', function () {
          validator.setErrorMessageResolver(undefined);
          expect(function () {
            validator.getErrorMessage('error_key');
          }).to.throws(Error, 'Please set an error message resolver via the setErrorMessageResolver function before attempting to resolve an error message.');
        });

        it('should call get error message on the set error message resolver', function (done) {
          var errorMessage = 'error message',
            defer = $q.defer(),
            invocationCount = 0,
            resolverFunc = function () {
              invocationCount += 1;
              return defer.promise;
            };

          validator.setErrorMessageResolver(resolverFunc);
          defer.resolve(errorMessage);

          validator.getErrorMessage('error_key').then(function (msg) {
            expect(invocationCount).to.equal(1);
            expect(msg).to.equal(errorMessage);
            done();
          });

          $rootScope.$apply();
        });

        it('should not call get error message on the set error message resolver it validation message is disabled', function (done) {
          var errorMessage = '',
            defer = $q.defer(),
            invocationCount = 0,
            resolverFunc = function () {
              invocationCount += 1;
              return defer.promise;
            },
            el = angular.element('<input type="text" required="" disable-validation-message=""/>');

          validator.setErrorMessageResolver(resolverFunc);
          defer.resolve(errorMessage);

          validator.getErrorMessage('error_key', el).then(function (msg) {
            expect(invocationCount).to.equal(0);
            expect(msg).to.equal(errorMessage);
            done();
          });

          $rootScope.$apply();
        });
      });

      describe('getDomModifier', function () {
        var bs3 = 'bs3',
          custom = 'custom',
          custom1 = 'custom1';

        beforeEach(inject(function ($injector) {
          validator.registerDomModifier(bs3, {
            makeValid: angular.noop,
            makeInvalid: angular.noop,
            name: bs3
          });
          validator.registerDomModifier(custom, {
            makeValid: angular.noop,
            makeInvalid: angular.noop,
            name: custom
          });
          validator.registerDomModifier(custom1, {
            makeValid: angular.noop,
            makeInvalid: angular.noop,
            name: custom1
          });
          validator.setDefaultElementModifier(bs3);
        }));

        it('should return the default dom modifier if the element has not specify a variant', function () {
          var modifier = validator.getDomModifier(angular.element('<input type="text" />'));

          expect(modifier).to.be.defined;
          expect(modifier.name).to.be.equal(bs3);
        });

        it('should return the custom dom modifier as defined on the element via the attribute data-element-modifier', function () {
          var modifier = validator.getDomModifier(angular.element('<input type="text" data-element-modifier="custom" />'));

          expect(modifier).to.be.defined;
          expect(modifier.name).to.be.equal(custom);
        });

        it('should return the default dom modifier if the defined modifier key on the element attribute data-element-modifier is empty', function () {
          var modifier = validator.getDomModifier(angular.element('<input type="text" data-element-modifier="" />'));

          expect(modifier).to.be.defined;
          expect(modifier.name).to.be.equal(bs3);
        });

        it('should return the default dom modifier if the defined modifer key on the element attribute element-modifier is empty', function () {
          var modifier = validator.getDomModifier(angular.element('<input type="text" element-modifier="" />'));

          expect(modifier).to.be.defined;
          expect(modifier.name).to.be.equal(bs3);
        });

        it('should return the custom dom modifier as defined on the element via the attribute element-modifier', function () {
          var modifier = validator.getDomModifier(angular.element('<input type="text" element-modifier="custom1" />'));

          expect(modifier).to.be.defined;
          expect(modifier.name).to.be.equal(custom1);
        });
      });

      describe('setDefaultDomModifier', function () {
        it('should throw error as no default modifier has been set', function () {
          var wrappingFunc = function () {
            validator.makeInvalid(angular.element('<input type="text"/>'));
          };

          validator.defaultElementModifier = undefined;
          expect(wrappingFunc).to.throws(Error);
        });
      });

      describe('makeValid', function () {
        var bs3 = 'bs3',
          makeValidInvocationCount = 0,
          domModifier = {
            makeValid: function () {
              makeValidInvocationCount += 1;
            },
            makeInvalid: angular.noop,
            name: bs3
          };

        beforeEach(inject(function ($injector) {
          validator.registerDomModifier(bs3, domModifier);
          validator.setDefaultElementModifier(bs3);
        }));

        afterEach(function () {
          makeValidInvocationCount = 0;
        });

        it('should call makeValid on the dom modifier once', function () {
          validator.makeValid(angular.element('<input type="text"/>'));
          expect(makeValidInvocationCount).to.equal(1);
        });

        it('should not call makeValid on the dom modifier if the element has disable-auto-validate attribute', function () {
          validator.makeValid(angular.element('<input type="text" disable-auto-validate="true"/>'));
          expect(makeValidInvocationCount).to.equal(0);
        });

        it('should not call makeValid on the dom modifier if enableValidElementStyling is false', function () {
          validator.setValidElementStyling(false);
          validator.makeValid(angular.element('<input type="text"/>'));
          expect(makeValidInvocationCount).to.equal(0);
        });

        it('should not call makeValid on the dom modifier if the element has disabled valid element styling', function () {
          validator.makeValid(angular.element('<input type="text" disable-valid-styling="true"/>'));
          expect(makeValidInvocationCount).to.equal(0);
        });

        it('should call makeDefault on the dom modifier if the element has disabled valid element styling', function () {
          sandbox.stub(validator, 'makeDefault');
          validator.makeValid(angular.element('<input type="text" disable-valid-styling="true"/>'));

          expect(validator.makeDefault.calledOnce).to.equal(true);
        });

        it('should call makeValid on the dom modifier if the element has not disabled valid element styling', function () {
          validator.makeValid(angular.element('<input type="text" disable-valid-styling="false"/>'));
          expect(makeValidInvocationCount).to.equal(1);
        });
      });

      describe('makeInvalid', function () {
        var bs3 = 'bs3',
          makeInvalidInvocationCount = 0,
          domModifier = {
            makeValid: angular.noop,
            makeInvalid: function () {
              makeInvalidInvocationCount += 1;
            },
            name: bs3
          };

        beforeEach(function () {
          validator.registerDomModifier(bs3, domModifier);
          validator.setDefaultElementModifier(bs3);
        });

        afterEach(function () {
          makeInvalidInvocationCount = 0;
        });

        it('should call makeInvalid on the dom modifier once', function () {
          validator.makeInvalid(angular.element('<input type="text"/>'));
          expect(makeInvalidInvocationCount).to.equal(1);
        });

        it('should not call makeInvalid on the dom modifier if enableInvalidElementStyling is false', function () {
          validator.setInvalidElementStyling(false);
          validator.makeInvalid(angular.element('<input type="text"/>'));
          expect(makeInvalidInvocationCount).to.equal(0);
        });

        it('should not call makeInvalid on the dom modifier if the element has disabled invalid element styling', function () {
          validator.makeInvalid(angular.element('<input type="text" disable-invalid-styling="true"/>'));
          expect(makeInvalidInvocationCount).to.equal(0);
        });

        it('should call makeInvalid on the dom modifier if the element has disabled invalid element styling', function () {
          validator.makeInvalid(angular.element('<input type="text" disable-invalid-styling="false"/>'));
          expect(makeInvalidInvocationCount).to.equal(1);
        });

        it('should call makeDefault on the dom modifier if the element has disabled invalid element styling', function () {
          sandbox.stub(validator, 'makeDefault');
          validator.makeInvalid(angular.element('<input type="text" disable-invalid-styling="true"/>'));

          expect(validator.makeDefault.calledOnce).to.equal(true);
        });

        it('should call makeInvalid on the dom modifier if the element has not disabled invalid element styling', function () {
          validator.makeInvalid(angular.element('<input type="text" disable-invalid-styling="false"/>'));
          expect(makeInvalidInvocationCount).to.equal(1);
        });
      });

      describe('makeDefault', function () {
        var bs3 = 'bs3',
          makeDefaultInvocationCount = 0,
          domModifier = {
            makeValid: angular.noop,
            makeInvalid: angular.noop,
            makeDefault: function () {
              makeDefaultInvocationCount += 1;
            },
            name: bs3
          };

        beforeEach(function () {
          validator.registerDomModifier(bs3, domModifier);
          validator.setDefaultElementModifier(bs3);
        });

        afterEach(function () {
          makeDefaultInvocationCount = 0;
        });

        it('should call makeDefault on the dom modifier once', function () {
          validator.makeDefault(angular.element('<input type="text"/>'));
          expect(makeDefaultInvocationCount).to.equal(1);
        });
      });
    });
  });
}(angular, sinon));
