var todoApp = angular.module('todoApp', []);

function mainController($scope, $http){
  $scope.getData = function(){
    $http.get('/api/getSummary').success(function(data){
      $scope.dataSummary = data;
    }).error(function(data){
      console.log('Error: ' + data);
    });
  }
}
