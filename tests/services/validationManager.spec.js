(function (angular, sinon) {
    'use strict';

    describe('jcs-autoValidate validationManager', function () {
        var sandbox, $rootScope, $q, validator, validationManager, modelCtrl, defer,
            setModelCtrl = function () {
                modelCtrl = {
                    $parsers: [],
                    $formatters: [],
                    $name: 'name'
                };
            };

        beforeEach(module('jcs-autoValidate'));

        describe('validationManager', function () {
            beforeEach(inject(function ($injector) {
                sandbox = sinon.sandbox.create();
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                defer = $q.defer();
                validator = $injector.get('validator');
                validationManager = $injector.get('validationManager');

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
                it('should return if no $parsers or $formatters on the controller', function () {
                    validationManager.validateElement(modelCtrl);
                    expect(validator.makeValid.called).to.equal(false);
                    expect(validator.makeInvalid.called).to.equal(false);
                });
                it('should return if form is pristine', function () {
                    modelCtrl.$pristine = true;
                    validationManager.validateElement(modelCtrl);

                    expect(validator.makeValid.called).to.equal(false);
                    expect(validator.makeInvalid.called).to.equal(false);
                });

                it('should call validator to make element valid when there are $formatters and the form is valid', function () {
                    var el = angular.element('<input type="test" />');
                    modelCtrl.$formatters.push(angular.noop);
                    modelCtrl.$pristine = false;
                    modelCtrl.$invalid = false;

                    validationManager.validateElement(modelCtrl, el);
                    expect(validator.makeValid.calledOnce).to.equal(true);
                    expect(validator.makeValid.calledWith(el)).to.equal(true);
                });

                it('should call validator to make element invalid when there are $formatters and the form is invalid', function () {
                    var el = angular.element('<input type="test" />'),
                        errorMsg = 'msg';
                    modelCtrl.$formatters.push(angular.noop);
                    modelCtrl.$pristine = false;
                    modelCtrl.$invalid = true;
                    modelCtrl.$error = {
                        required: true
                    };

                    defer.resolve(errorMsg);
                    validationManager.validateElement(modelCtrl, el);

                    $rootScope.$apply();

                    expect(validator.makeInvalid.calledOnce).to.equal(true);
                    expect(validator.makeInvalid.calledWith(el, errorMsg)).to.equal(true);
                });

                it('should call validator to make element invalid when there are $parsers and the form is invalid', function () {
                    var el = angular.element('<input type="test" />'),
                        errorMsg = 'msg';
                    modelCtrl.$parsers.push(angular.noop);
                    modelCtrl.$pristine = false;
                    modelCtrl.$invalid = true;
                    modelCtrl.$error = {
                        required: true
                    };

                    defer.resolve(errorMsg);
                    validationManager.validateElement(modelCtrl, el);

                    $rootScope.$apply();

                    expect(validator.makeInvalid.calledOnce).to.equal(true);
                    expect(validator.makeInvalid.calledWith(el, errorMsg)).to.equal(true);
                });
            });
        });
    });
}(angular, sinon));
