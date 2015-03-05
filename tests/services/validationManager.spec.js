(function (angular, sinon) {
    'use strict';

    describe('jcs-autoValidate validationManager', function () {
        var sandbox, $rootScope, $compile, $q, validator, validationManager, modelCtrl, defer,
            setModelCtrl = function () {
                modelCtrl = {
                    $parsers: [],
                    $formatters: [],
                    $name: 'name'
                };
            },
            compileElement = function (html) {
                var element = angular.element(html);
                $compile(element)($rootScope);
                $rootScope.$digest();
                return element;
            };

        beforeEach(module('jcs-autoValidate'));

        describe('validationManager', function () {
            beforeEach(inject(function ($injector) {
                sandbox = sinon.sandbox.create();
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
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
                it('should return true if the control is pristine and not make the element valid', function () {
                    var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
                        result;
                    modelCtrl.$pristine = true;
                    result = validationManager.validateElement(modelCtrl, el);
                    expect(result).to.equal(true);
                    expect(validator.makeValid.called).to.equal(false);
                    expect(validator.makeInvalid.called).to.equal(false);
                });

                it('should make the element valid and return true if the control is not pristine and has no validation requirements', function () {
                    var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
                        result;
                    modelCtrl.$pristine = false;
                    result = validationManager.validateElement(modelCtrl, el);
                    expect(result).to.equal(true);
                    expect(validator.makeValid.called).to.equal(true);
                    expect(validator.makeInvalid.called).to.equal(false);
                });

                it('should return true if the control is not touched and not make the element valid', function () {
                    var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
                        result;
                    modelCtrl.$touched = false;
                    result = validationManager.validateElement(modelCtrl, el);
                    expect(result).to.equal(true);
                    expect(validator.makeValid.called).to.equal(true);
                    expect(validator.makeInvalid.called).to.equal(false);
                });

                it('should make the element valid and return true if the control is touched and has no validation requirements', function () {
                    var el = angular.element('<input type="text" ng-model="propOne" required="" ng-minlength="10"/>'),
                        result;
                    modelCtrl.$touched = true;
                    result = validationManager.validateElement(modelCtrl, el);
                    expect(result).to.equal(true);
                    expect(validator.makeValid.called).to.equal(true);
                    expect(validator.makeInvalid.called).to.equal(false);
                });

                it('should call validator to make element valid when there are $formatters and the form is valid', function () {
                    var el = angular.element('<input type="text" ng-model="propOne"/>');
                    modelCtrl.$formatters.push(angular.noop);
                    modelCtrl.$pristine = false;
                    modelCtrl.$invalid = false;
                    validationManager.validateElement(modelCtrl, el);
                    expect(validator.makeValid.calledOnce).to.equal(true);
                    expect(validator.makeValid.calledWith(el)).to.equal(true);
                });

                it('should call validator to make element invalid when there are $formatters and the form is invalid', function () {
                    var el = angular.element('<input type="text" ng-model="propOne" />'),
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
                    var el = angular.element('<input type="text" ng-model="propOne"/>'),
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

                it('should return true if the input has no validation specified', function () {
                    var el = angular.element('<input type="text" ng-model="propertyOne" />'),
                        result;

                    result = validationManager.validateElement(modelCtrl, el);

                    expect(result).to.equal(true);
                });

                it('should call validator to make element valid it the control is marked as a custom form control', function () {
                    var el = angular.element('<div type="text" ng-model="propOne" register-custom-form-control=""></div>');

                    modelCtrl.$formatters.push(angular.noop);
                    modelCtrl.$pristine = false;
                    modelCtrl.$invalid = false;

                    validationManager.validateElement(modelCtrl, el);
                    expect(validator.makeValid.calledOnce).to.equal(true);
                    expect(validator.makeValid.calledWith(el)).to.equal(true);
                });

                it('should call validator to make element invalid it the control is marked as a custom form control', function () {
                    var el = angular.element('<div type="text" ng-model="propOne" register-custom-form-control=""></div>'),
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
            });

            describe('validateForm', function () {
                it('should return false it the form element is undefined', function () {
                    var result = validationManager.validateForm();

                    expect(result).to.equal(false);
                });

                it('should return true it the form controller is set to not auto validate the form', function () {
                    var form = compileElement('<form role="form" novalidate="novalidate" ng-submit="submit();" disable-dynamic-validation><input ng-model="name" required /></form>'),
                        result = validationManager.validateForm(form);

                    expect(result).to.equal(true);
                });

                it('should call validator makeInvalid once when a single form input element is invalid', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />'),
                        isValid;

                    frm.append(inpt);
                    inpt.controller('ngModel').$setValidity('minlength', false);
                    $rootScope.$apply();

                    defer.resolve('errorMsg');
                    isValid = validationManager.validateForm(frm);


                    $rootScope.$apply();

                    expect(isValid).to.equal(false);
                    expect(validator.makeInvalid.calledOnce).to.equal(true);
                });

                it('should call validator makeInvalid twice when a single form input element is invalid', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />'),
                        inpt2 = compileElement('<input type="text" ng-model="name" ng-maxlength="2" />'),
                        isValid;

                    frm.append(inpt);
                    frm.append(inpt2);
                    inpt.controller('ngModel').$setValidity('minlength', false);
                    inpt2.controller('ngModel').$setValidity('maxlength', false);
                    $rootScope.$apply();

                    defer.resolve('errorMsg');
                    isValid = validationManager.validateForm(frm);

                    $rootScope.$apply();

                    expect(isValid).to.equal(false);
                    expect(validator.makeInvalid.calledTwice).to.equal(true);
                });

                it('should call validator makeInvalid once when a single form input element is invalid in a child ng-form', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        ngFrm = compileElement('<ng-form name="childFrm"></ng-form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />'),
                        isValid;

                    ngFrm.append(inpt);
                    frm.append(ngFrm);
                    inpt.controller('ngModel').$setValidity('minlength', false);
                    $rootScope.$apply();

                    defer.resolve('errorMsg');
                    isValid = validationManager.validateForm(frm);

                    $rootScope.$apply();

                    expect(isValid).to.equal(false);
                    expect(validator.makeInvalid.calledOnce).to.equal(true);
                });
            });

            describe('resetForm', function () {
                it('should call validator.makeDefault for every input type element in the form', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />'),
                        inpt2 = compileElement('<input type="text" ng-model="lastname" ng-maxlength="2" />');

                    sandbox.stub(validator, 'makeDefault');

                    frm.append(inpt);
                    frm.append(inpt2);
                    $rootScope.$apply();

                    validationManager.resetForm(frm);

                    $rootScope.$apply();

                    expect(validator.makeDefault.calledTwice).to.equal(true);
                });

                it('should call validator makeDefault once when a single form input element is invalid in a child ng-form', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        ngFrm = compileElement('<ng-form name="childFrm"></ng-form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />');

                    sandbox.stub(validator, 'makeDefault');

                    ngFrm.append(inpt);
                    frm.append(ngFrm);
                    $rootScope.$apply();

                    validationManager.resetForm(frm);

                    $rootScope.$apply();

                    expect(validator.makeDefault.calledOnce).to.equal(true);
                });

                it('should set the model controller of the input element to pristine', function () {
                    var frm = compileElement('<form name="frm1"></form>'),
                        ngFrm = compileElement('<ng-form name="childFrm"></ng-form>'),
                        inpt = compileElement('<input type="text" ng-model="name" ng-minlength="2" />'),
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
