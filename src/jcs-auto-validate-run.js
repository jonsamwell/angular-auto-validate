function AutoValidateRunFn(validator, defaultErrorMessageResolver, bootstrap3ElementModifier, foundation5ElementModifier, foundation6ElementModifier) {
  validator.setErrorMessageResolver(defaultErrorMessageResolver.resolve);
  validator.registerDomModifier(bootstrap3ElementModifier.key, bootstrap3ElementModifier);
  validator.registerDomModifier(foundation5ElementModifier.key, foundation5ElementModifier);
  validator.registerDomModifier(foundation6ElementModifier.key, foundation6ElementModifier);
  validator.setDefaultElementModifier(bootstrap3ElementModifier.key);
}

AutoValidateRunFn.$inject = [
  'validator',
  'defaultErrorMessageResolver',
  'bootstrap3ElementModifier',
  'foundation5ElementModifier',
  'foundation6ElementModifier'
];

angular.module('jcs-autoValidate').run(AutoValidateRunFn);
