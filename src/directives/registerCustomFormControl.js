(function (angular) {
    'use strict';

    angular.module('jcs-autoValidate').directive('registerCustomFormControl', [
        function () {
            var findParentForm = function (el) {
                var form;
                var recursiveUntilFormElm = function (parent) {
                    if (parent !== undefined) {
                        if (parent.nodeName.toLowerCase() === 'form') {
                            form = parent;
                        } else {
                            recursiveUntilFormElm(angular.element(parent).parent()[0]);
                        }
                    }
                };
                recursiveUntilFormElm(el);
                return form;
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
    ]);
}(angular));
