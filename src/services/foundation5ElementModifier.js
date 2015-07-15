(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('foundation5ElementModifier', [

            function () {
                /**
                 * @param {Element} el - The input control element that is the target of the validation.
                 */
                var reset = function (el) {
                        var nextEl = el.next();
                        if (nextEl.hasClass('error')) {
                            nextEl.remove();
                        }
                        el.removeClass('error');
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeValid
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear valid by apply Foundation 5 specific styles and child elements.
                     * See: http://foundation.zurb.com/docs/components/forms.html
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeValid = function (el) {
                        reset(el);
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeInvalid
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear invalid by apply Foundation 5 specific styles and child elements.
                     * See: http://foundation.zurb.com/docs/components/forms.html
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeInvalid = function (el, errorMsg) {
                        reset(el);
                        el.addClass('error');
                        el.after(angular.element('<small class="error">' + errorMsg + '</small>'));
                    },

                    /**
                     * @ngdoc function
                     * @name foundation5ElementModifier#makeDefault
                     * @methodOf foundation5ElementModifier
                     *
                     * @description
                     * Makes an element appear in its default visual state by apply foundation 5 specific styles and child elements.
                     *
                     * @param {Element} el - The input control element that is the target of the validation.
                     */
                    makeDefault = function (el) {
                        makeValid(el);
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    makeDefault: makeDefault,
                    key: 'foundation5'
                };
            }
        ]);
}(angular));
