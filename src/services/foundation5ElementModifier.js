(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate')
        .factory('foundation5ElementModifier', [

            function () {
                var reset = function (el) {
                        el.find('small.error').remove();
                        el.removeClass('error');
                    },
                    findParentColumn = function (el) {
                        return el.closest('.columns');
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
                        var parentColumn = findParentColumn(el);
                        reset(parentColumn && parentColumn.length > 0 ? parentColumn : el);
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
                        var parentColumn = findParentColumn(el),
                            helpTextEl;
                        reset(parentColumn || el);
                        el.addClass('error');
                        if (parentColumn) {
                            helpTextEl = angular.element('<small class="error">' + errorMsg + '</small>');
                            parentColumn.append(helpTextEl);
                        }
                    };

                return {
                    makeValid: makeValid,
                    makeInvalid: makeInvalid,
                    key: 'foundation5'
                };
            }
        ]);
}(angular));
