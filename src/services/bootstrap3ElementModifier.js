(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('bootstrap3ElementModifier', [

            function () {
                var reset = function (el) {
                        el.find('.error-msg').remove();
                        el.find('.form-control-feedback').remove();
                        el.removeClass('has-success has-error has-feedback');
                    },
                    findFormGroupElement = function (el) {
                        return el.closest('.form-group');
                    },

                    /**
                     * @ngdoc property
                     * @name bootstrap3ElementModifier#addValidationStateIcons
                     * @propertyOf bootstrap3ElementModifier
                     * @returns {bool} True if an state icon will be added to the element in the valid and invalid control
                     * states.  The default is false.
                     */
                    addValidationStateIcons = false,

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#enableValidationStateIcons
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply an icon to the input element.
                     *
                     * @param {bool} enable - True to enable the icon otherwise false.
                     */
                    enableValidationStateIcons = function (enable) {
                        addValidationStateIcons = enable;
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeValid
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear valid by apply bootstrap 3 specific styles and child elements. If the service
                     * property 'addValidationStateIcons' is true it will also append validation glyphicon to the element.
                     * See: http://getbootstrap.com/css/#forms-control-validation
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeValid = function (el) {
                        var frmGroupEl = findFormGroupElement(el);
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-success has-feedback');
                        if (addValidationStateIcons) {
                            frmGroupEl.append(angular.element('<span class="glyphicon glyphicon-ok form-control-feedback"></span>'));
                        }
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeInvalid
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply bootstrap 3 specific styles and child elements. If the service
                     * property 'addValidationStateIcons' is true it will also append validation glyphicon to the element.
                     * See: http://getbootstrap.com/css/#forms-control-validation
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeInvalid = function (el, errorMsg) {
                        var frmGroupEl = findFormGroupElement(el),
                            helpTextEl = angular.element('<span class="help-text has-error error-msg">' + errorMsg + '</span>');
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-error has-feedback');
                        frmGroupEl.append(helpTextEl);
                        if (addValidationStateIcons) {
                            frmGroupEl.append(angular.element('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'));
                        }
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    enableValidationStateIcons: enableValidationStateIcons,
                    key: 'bs3'
                };
            }
        ]);
}(angular));
