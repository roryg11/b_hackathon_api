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

    var previouslyAppliedColor = "color-white";

    // angular.element($window).bind("scroll", function(e) {
    //   var scroll = $window.pageYOffset + ($window.innerHeight/3);
    //   var elementColors = angular.element.find('.element-color');
    //   function classToRemove (){
    //
    //   }
    //   for(var i=0; i < elementColors.length; i++){
    //     if(elementColors[i].offsetTop <=scroll && elementColors[i].offsetTop + elementColors[i].offsetHeight > scroll){
    //       angular.element.find('.container-to-recolor')[0].classList.remove(previouslyAppliedColor);
    //       var color = "color-" + elementColors[i].getAttribute('data-color');
    //       angular.element.find('.container-to-recolor')[0].classList.add(color);
    //       previouslyAppliedColor = color;
    //     }
    //   }
    //
    // });
  });



})();

