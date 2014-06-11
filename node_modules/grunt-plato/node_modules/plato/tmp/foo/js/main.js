
requirejs.config({
});

requirejs(
  [
    '../config'
  ],
  function (config) {
    // todo: evaluate better, more static ways of requiring child components
    var componentDependencies = config.components.map(function(component){return '../components/' + component;});

    require(componentDependencies, function(){
      require(['app'], function(){
        angular.bootstrap(document, ['platoApp']);
      });
    });

  }
);