(function(){
  var todoApp = angular.module('todoApp', [
    "kendo.directives"
  ]).controller('mainController', function($scope, $http, $window, $timeout){
    $scope.selected = [];

    $scope.toggleCheckbox= function (dataItem, event){
      if(event.currentTarget.checked){
        $scope.selected.push(dataItem);
      } else {
        var existingIndex = $scope.selected.indexOf(dataItem);
        $scope.selected.splice(existingIndex, 1);
      }
    };

    function setUpDashboardList (dashboardResponse){
      var schema = {
        model : {
          id: "id",
          fields: {
            "id": {type: "number"},
            "displayInfo": {
              type: 'string',
              from: 'displayInfo.name'
            },
            "owner": {
              type: "string",
              from: "userPermissions.owner.firstName"
            },
            "cost": {
              type: "number",
              from: "cost"
            },
            "inStock": {
              type: "number",
              from: "inStock"
            },
            "dateAdded": {
              type: "date",
              from: "dateAdded"
            }
          }
        }
      };

      $scope.mainGridOptions = {
        // dataSource: dashboardResponse,
        dataSource: {
          type: "json",
          transport: {
            read: "/api/dashboards"
          },
          schema: schema,
          batch: true,
          pageSize: 10
          // serverPagination: true
          // serverPaging: true
          // group: {
          //   field: "CategoryID", aggregates: [
          //     { field: "cost", aggregate: "sum" },
          //     { field: "inStock", aggregate: "sum" }
          //   ]
          // },
          // aggregate: [
          //   { field: "cost", aggregate: "sum" },
          //   { field: "inStock", aggregate: "sum" }
          // ]
        },
        editable: true,
        sortable: true,
        selectable:"multiple, row",
        filterable: {
          mode: "row"
        },
        navigatable: true,
        pageable: true,
        mobile: true,
        // toolbar: ["create", "save", "cancel"],
        dataBound: function(e){ //event handler for "dataBound" event
          console.log("-> Data is bound to the Grid");
          angular.element(".checkbox").bind("change", function (e) {
            $(e.target).closest("tr").toggleClass("k-state-selected");
          });
        },
        change: function(e, test){ //event handler for "change" event
          var selectedDataItem = e.sender.dataItem(e.sender.select());
          console.log("-> Selected Dashboard: " + selectedDataItem.displayInfo);
          $('tr').find('[type=checkbox]').prop('checked', false);
          $('tr.k-state-selected').find('[type=checkbox]').prop('checked', true);
        },
        columns: [{
          title: "select",
          width: '50px',
          template: '<input class="checkbox" type="checkbox" ng-click="toggleCheckbox(dataItem, $event)"/>'
        },{
          field: "id",
          title: "ID",
          width: "100px"
        },{
          field: "displayInfo",
          title: "Dashboard Name"
        },{
          field: "owner",
          title: "Owner"
          // template: "#= userPermissions.owner.firstName + ' ' + userPermissions.owner.lastName #"
        },{
          //   field: "cost",
          //   title: "Cost",
          //   footerTemplate: "{{ column.title }} : {{ aggregate.sum | currency }}",
          //   groupFooterTemplate:"{{ dataItem.cost.sum | currency }}"
          // },{
          //   field: "inStock",
          //   title: "In Stock",
          //   aggregates: ["sum"],
          //   footerTemplate: "{{ column.title }} : {{ aggregate.sum }}",
          //   groupFooterTemplate: "{{ dataItem.inStock.sum }}"
          // },{
          field: "dateAdded",
          title: "Date Added",
          type: "date",
          format: "{0:MM/dd/yyyy}"
          // template: "#= kendo.toString(new Date(parseInt(dateAdded)), 'yyyy-MM-dd HH:mm:ss') #"
        }]
      };

    }

    // var transport = {
    //     read:   "/Products",
    //     update: {
    //       url: "/Products/Update",
    //       type: "POST"
    //     },
    //     destroy: {
    //       url: "/Products/Destroy",
    //       type: "POST"
    //     },
    //     create: {
    //       url: "/Products/Create",
    //       type: "POST"
    //     },
    //   // determines if changes will be send to the server individually or as batch
    //   batch: true
    //   //...
    // };

    ////// --- old stuff--- ///////
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
        $scope.dashboards = response.data;
        $scope.dashboardLength = $scope.dashboards.length;
        setUpDashboardList($scope.dashboards);
        // $scope.dashboardSummary = response.data.filter(createdThisYear);
        // $scope.numberOfDashboards = $scope.dashboardSummary.length;
        // $scope.masterOwners = getTopOwners($scope.dashboardSummary);
      }, function(data){
        console.log('Error: ' + data);
      });
    };

    $scope.getScorecardsList = function(){
      $http.get('/api/scorecards').then(function(response){
        $scope.scorecards = response.data;
        // $scope.scorecardSummary = response.data.filter(createdThisYear);
        // $scope.numberOfScorecards = $scope.scorecardSummary.length;
        // $scope.scorecardSamurai = getTopOwners($scope.scorecardSummary);
      }, function(data){
        console.log('Error: ' + data);
      });
    };

    $scope.getGoogleAnalytics = function () {
      $http.get('/googleAnalytics').then(function(response) {
        $scope.googleAnalytics = response.data;
        $scope.googleAnalytics.totalMinutesSpent = $scope.googleAnalytics.totalHoursSpent;
        $scope.googleAnalytics.totalHoursSpent =  Math.floor($scope.googleAnalytics.totalHoursSpent/60);
        $scope.googleAnalytics.totalDaysSpent = Math.floor($scope.googleAnalytics.totalHoursSpent/24);
      });
    };

    $scope.getDashboardsList();
    $scope.getScorecardsList();
    $scope.getData();
  });



})();

