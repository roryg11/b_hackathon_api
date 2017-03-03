var todoApp = angular.module('todoApp', []);

function mainController($scope, $http){
  $http.get('/api/getSummary').success(function(data){
    $scope.dataSummary = data;
    console.log(data);
  }).error(function(data){
    console.log('Error: ' + data);
  });

}

