function foundation6ElementModifierFn() {
  var reset = function (el, inputEl) {
      angular.forEach(el.find('small'), function (smallEl) {
        if (angular.element(smallEl).hasClass('form-error is-visible')) {
          angular.element(smallEl).remove();
        }
      });

      inputEl.removeClass('alert callout');
    },
    findParentColumn = function (el) {
      var parent = el;
      for (var i = 0; i <= 3; i += 1) {
        if (parent !== undefined && (parent.hasClass('columns') || parent.hasClass('column'))) {
          break;
        } else if (parent !== undefined) {
          parent = parent.parent();
        }
      }

      return parent;
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeValid
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear valid by apply Foundation 6 specific styles and child elements.
     * See: http://foundation.zurb.com/sites/docs/forms.html
     *
     * @param {Element} el - The input control element that is the target of the validation.
     */
    makeValid = function (el) {
      var parentColumn = findParentColumn(el);
      reset(parentColumn && parentColumn.length > 0 ? parentColumn : el, el);
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeInvalid
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear invalid by apply Foundation 6 specific styles and child elements.
     * See: http://foundation.zurb.com/sites/docs/forms.html
     *
     * @param {Element} el - The input control element that is the target of the validation.
     */
    makeInvalid = function (el, errorMsg) {
      var parentColumn = findParentColumn(el),
        helpTextEl;
      reset(parentColumn || el, el);
      el.addClass('alert callout');
      if (parentColumn) {
        helpTextEl = angular.element('<small class="form-error is-visible">' + errorMsg + '</small>');
        parentColumn.append(helpTextEl);
      }
    },

    /**
     * @ngdoc function
     * @name foundation6ElementModifier#makeDefault
     * @methodOf foundation6ElementModifier
     *
     * @description
     * Makes an element appear in its default visual state by apply Foundation 6 specific styles and child elements.
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
    key: 'foundation6'
  };
}

angular.module('jcs-autoValidate').factory('foundation6ElementModifier', foundation6ElementModifierFn);
