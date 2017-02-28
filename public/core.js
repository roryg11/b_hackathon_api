var todoApp = angular.module('todoApp', []);

function mainController($scope, $http){
  $scope.formData = {};

  $http.get('/api/todos').success(function(data){
    $scope.todos = data;
    console.log(data);
  }).error(function(data){
    console.log('Error: ' + data);
  });

  $http.get('/api/getSummary').success(function(data){
    $scope.dataSummary = data;
    console.log(data);
  }).error(function(data){
    console.log('Error: ' + data);
  });

}
