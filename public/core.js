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

    function growBar(elem, totalWidth) {
      var width = 1;
      var id = setInterval(frame, 10);
      function frame() {
        if (width >= totalWidth) {
          clearInterval(id);
        } else {
          width++;
          elem.style.width = width + '%';
        }
      }
    }

    var secondFrameTrigger = false;


    var zeroPanel = angular.element.find("#frame1")[0].offsetTop;

    angular.element($window).bind("scroll", function(e) {

       if ($window.pageYOffset < zeroPanel - 500) {
         secondFrameTrigger = false;
         console.log("below first frame");
       } else if ($window.pageYOffset > zeroPanel - 500 && $window.pageYOffset < zeroPanel) {
         console.log("in first frame");
       } else if ($window.pageYOffset > zeroPanel && $window.pageYOffset < zeroPanel + 500 ) {
         console.log("in second frame");
         //fill hours at beckon chart
         if (!secondFrameTrigger) {
           if (angular.element('.progress-fill span').length) {
             var innerTextValue = angular.element('.progress-fill span')[0].innerText;
             var greatestValue = innerTextValue.substr(0, innerTextValue.length - 8);
             angular.element('.progress-fill span').each(function(){
               var minuteValue = this.innerText;
               var percentFill = ((minuteValue.substr(0, minuteValue.length - 8)/greatestValue) * 100);
               growBar(this.parentElement, percentFill);
             });
             secondFrameTrigger = true;
           }
         }

       } else if ($window.pageYOffset > zeroPanel + 500 && $window.pageYOffset < zeroPanel + 500*2) {
         console.log("in third frame");
       } else if ($window.pageYOffset > zeroPanel + 500*2 && $window.pageYOffset < zeroPanel + 500*3) {
         console.log("in fourth frame");
       } else if ($window.pageYOffset > zeroPanel + 500*3 && $window.pageYOffset < zeroPanel + 500*4) {
         console.log("in fifth frame");
       } else if ($window.pageYOffset > zeroPanel + 500*4 && $window.pageYOffset < zeroPanel + 500*5) {
         console.log("in sixth frame");
       } else if ($window.pageYOffset > zeroPanel + 500*5 && $window.pageYOffset < zeroPanel + 500*6) {
         console.log("in seventh frame");
       } else if ($window.pageYOffset > zeroPanel + 500*6 && $window.pageYOffset < zeroPanel + 500*7) {
         console.log("in eigth frame");
       }

    });

    // var previouslyAppliedColor = "color-white";
    // var path = angular.element.find('#wanderer')[0];
    // var pathLength = path.getTotalLength();
    // path.style.strokeDasharray = pathLength + ' ' + pathLength;
    // path.style.strokeDashoffset = pathLength;
    //
    // angular.element($window).bind("scroll", function(e) {
    //   console.log("OFFSET");
    //   console.log($window.pageYOffset);
    //   var scroll = $window.pageYOffset + ($window.innerHeight/3);
    //   var scrollPercentage = ($window.pageYOffset) / ($window.innerHeight - $window.pageYOffset);
    //   console.log("SCROLL PERCENTAGE");
    //   console.log(scrollPercentage );
    //   var drawLength = pathLength * scrollPercentage;
    //   path.style.strokeDashoffset = pathLength - drawLength;
    //   if (scrollPercentage >= 0.99) {
    //     path.style.strokeDasharray = "none";
    //   } else {
    //     path.style.strokeDasharray = pathLength + ' ' + pathLength;
    //   }
    // });
  });



})();

