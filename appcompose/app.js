angular
  .module('dropboxImportAddIn', [
  'ngRoute'
])
.controller('DropboxImportController',['$rootScope','$scope',function($rootScope,$scope){
  $scope.showButton=true;
  $scope.$on('dropbox.file',function(event,param){
    
    if(param.link){
      Office.context.mailbox.item.body.getAsync("html",{},function(asyncResult){
        if(asyncResult.status==="succeeded"){
          var bodyHtml="<a target=\"_blank\" href=\""+param.url+"\">"+param.name+"</a>";
          Office.cast.item.toItemCompose(Office.context.mailbox.item).body.setSelectedDataAsync(bodyHtml,{coercionType: Office.CoercionType.Html},function(asyncResult){});
        }
      });

    }
    else{
      Office.cast.item.toItemCompose(Office.context.mailbox.item).addFileAttachmentAsync(param.url,param.name,function(asyncResult){
        if(asyncResult.error){
          alert(asyncResult.error.message);
        }
      });
    }
  });
}])
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})
//bootstrap angular manually when office is ready!
  Office.initialize=function(){
    //angular.bootstrap(document.getElementById('container'), ['dropboxImportAddIn']);
    console.log("initialize Office");
  };
