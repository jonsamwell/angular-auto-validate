function AutoValidateRunFn(validator, defaultErrorMessageResolver, bootstrap3ElementModifier, foundation5ElementModifier) {
  validator.setErrorMessageResolver(defaultErrorMessageResolver.resolve);
  validator.registerDomModifier(bootstrap3ElementModifier.key, bootstrap3ElementModifier);
  validator.registerDomModifier(foundation5ElementModifier.key, foundation5ElementModifier);
  validator.setDefaultElementModifier(bootstrap3ElementModifier.key);
}

AutoValidateRunFn.$inject = [
  'validator',
  'defaultErrorMessageResolver',
  'bootstrap3ElementModifier',
  'foundation5ElementModifier'
];

angular.module('jcs-autoValidate').run(AutoValidateRunFn);
