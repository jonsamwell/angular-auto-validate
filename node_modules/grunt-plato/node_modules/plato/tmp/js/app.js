
define(
  [
    '../config',
    '../reports/aggregate'
  ],
  function(config, reportsAggregate){


    var loginApp = angular.module('platoApp', [

    ].concat(config.components));

    loginApp.controller('appCtrl', [
      '$scope',
      function($scope) {
        $scope.config = config;
        $scope.reports = reportsAggregate;

        $scope.classForLength = function(length) {
          var columns = 12 / length;
          return 'large-' + columns + ' columns';
        };

      }
    ]);

    loginApp.directive('platoElement', ['$compile', function($compile){

      return {
        restrict : 'A',
        scope : {
          element : '=',
          config : '=',
          reports : '='
        },
//        transclude : true,
        link : function(scope, element, attrs){
          element.append($compile(scope.element)(scope));
        }
      };
    }]);


});