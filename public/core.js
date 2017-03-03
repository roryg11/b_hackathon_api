(function(){
  var todoApp = angular.module('todoApp', [

  ]).controller('mainController', function($scope, $http, $window){
    var dateOneYearAgo = new Date('March 3 2016').getTime();
    var dateToday = new Date().getTime();
    function getTopOwners (entityList){
      var ownerMap = {};
      for(var i =0; i < entityList.length; i++){
        var name = entityList[i].userPermissions.owner.firstName + " " + entityList[i].userPermissions.owner.lastName;
        if(ownerMap[name]){
          ownerMap[name] = ownerMap[name] +1;
        } else {
          ownerMap[name]= 1;
        }
      }
      var sortable = [];
      for(var nameKey in ownerMap){
        sortable.push([nameKey, ownerMap[nameKey]]);
      }
      return sortable;
    }

    function createdThisYear (entity){
      if(entity.type === "SCORECARD_DTO"){
        return entity.createdAt > dateOneYearAgo && entity.createdAt < dateToday;
      } else {
        return entity.dateAdded > dateOneYearAgo && entity.dateAdded < dateToday;
      }
    }

    $scope.getData = function(){
      $http.get('/api/getSummary').then(function(response){
        $scope.dataSummary = response.data;
      }, function(data){
        console.log('Error: ' + data);
      });
    };

    $scope.getDashboardsList = function(){
      $http.get('/api/dashboards').then(function(response){
        $scope.dashboardSummary = response.data.filter(createdThisYear);
        $scope.numberOfDashboards = $scope.dashboardSummary.length;
        $scope.masterOwners = getTopOwners($scope.dashboardSummary);
      }, function(data){
        console.log('Error: ' + data);
      });
    };

    $scope.getScorecardsList = function(){
      $http.get('/api/scorecards').then(function(response){
        $scope.scorecardSummary = response.data.filter(createdThisYear);
        $scope.numberOfScorecards = $scope.scorecardSummary.length;
        $scope.scorecardSamurai = getTopOwners($scope.scorecardSummary);
      }, function(data){
        console.log('Error: ' + data);
      });
    };

    $scope.getGoogleAnalytics = function () {
      $http.get('/googleAnalytics').then(function(response) {
        $scope.googleAnalytics = response.data;
      });
    };

    var previouslyAppliedColor = "color-white";
    var path = angular.element.find('#wanderer')[0];
    var pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength + ' ' + pathLength;
    path.style.strokeDashoffset = pathLength;

    angular.element($window).bind("scroll", function(e) {
      console.log("OFFSET");
      console.log($window.pageYOffset);
      var scrollPercentage = ($window.pageYOffset) / ($window.innerHeight - $window.pageYOffset);
      console.log("SCROLL PERCENTAGE");
      console.log(scrollPercentage ); 
      var drawLength = pathLength * scrollPercentage;
      path.style.strokeDashoffset = pathLength - drawLength;
      if (scrollPercentage >= 0.99) {
        path.style.strokeDasharray = "none";
      } else {
        path.style.strokeDasharray = pathLength + ' ' + pathLength;
      }
    });
  });



})();

