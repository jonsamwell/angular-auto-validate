(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('bootstrap3ElementModifier', [

            function () {
                var reset = function (el) {
                        angular.forEach(el.find('span'), function (spanEl) {
                            spanEl = angular.element(spanEl);
                            if (spanEl.hasClass('error-msg') || spanEl.hasClass('form-control-feedback')) {
                                spanEl.remove();
                            }
                        });

                        el.removeClass('has-success has-error has-feedback');
                    },
                    findFormGroupElement = function (el) {
                        var parent = el;
                        for (var i = 0; i <= 3; i += 1) {
                            if (parent !== undefined && parent.hasClass('form-group')) {
                                break;
                            } else if (parent !== undefined) {
                                parent = parent.parent();
                            }
                        }

                        return parent;
                    },

                    insertAfter = function (referenceNode, newNode) {
                        referenceNode[0].parentNode.insertBefore(newNode[0], referenceNode[0].nextSibling);
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
                            insertAfter(el, angular.element('<span class="glyphicon glyphicon-ok form-control-feedback"></span>'));
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
                            helpTextEl = angular.element('<span class="help-block has-error error-msg">' + errorMsg + '</span>');
                        reset(frmGroupEl);
                        frmGroupEl.addClass('has-error has-feedback');
                        insertAfter(el, helpTextEl);
                        if (addValidationStateIcons) {
                            insertAfter(el, angular.element('<span class="glyphicon glyphicon-remove form-control-feedback"></span>'));
                        }
                    },

                    /**
                     * @ngdoc function
                     * @name bootstrap3ElementModifier#makeDefault
                     * @methodOf bootstrap3ElementModifier
                     *
                     * @description
                     * Makes an element appear in its default visual state by apply bootstrap 3 specific styles and child elements.
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeDefault = function (el) {
                        var frmGroupEl = findFormGroupElement(el);
                        reset(frmGroupEl);
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    makeDefault: makeDefault,
                    enableValidationStateIcons: enableValidationStateIcons,
                    key: 'bs3'
                };
            }
        ]);
}(angular));
