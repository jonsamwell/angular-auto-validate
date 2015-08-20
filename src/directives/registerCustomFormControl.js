function RegisterCustomFormControlFn() {
  var findParentForm = function (el) {
    var parent = el;
    for (var i = 0; i <= 50; i += 1) {
      if (parent !== undefined && parent.nodeName.toLowerCase() === 'form') {
        break;
      } else if (parent !== undefined) {
        parent = angular.element(parent).parent()[0];
      }
    }

    return parent;
  };

  return {
    restrict: 'A',
    link: function (scope, element) {
      var frmEl = findParentForm(element.parent()[0]);
      if (frmEl) {
        frmEl.customHTMLFormControlsCollection = frmEl.customHTMLFormControlsCollection || [];
        frmEl.customHTMLFormControlsCollection.push(element[0]);
      }
    }
  };
}

angular.module('jcs-autoValidate').directive('registerCustomFormControl', RegisterCustomFormControlFn);
