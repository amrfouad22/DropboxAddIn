'use strict';
angular.module('dropboxImportAddIn')
  //service factory
  .factory('DropboxAPI', ['$http', '$rootScope',function($http) {
  var service = {};
  service.getFiles = function(clientId,receiverUrl,dir,callback) {
    this.client = new Dropbox.Client({ key: clientId});
    this.client.authDriver(new Dropbox.AuthDriver.Popup({
      receiverUrl: receiverUrl
    }));
    this.client.authenticate({}, function(error,client){
      client.readdir(dir, {removed:true}, callback);    
    });
  };
  service.getFileUrl=function(path,download,callback){
    if(download=='true'){
        this.client.makeUrl(path,{download:true},callback);
    }
    else{
    this.client.makeUrl(path,{longUrl:true},callback);
    }
  }
  return service;
}])
/**directive takes 4 parameters
1-dir           (starting path default to root "/")
2-receiver-url  (auth redirect url)
3-client-id     (dropbox app client Id)
4-template      (render files tempalte)
**/
.directive('dropbox',['DropboxAPI','$templateCache','$compile','$http','$rootScope',function(DropboxAPI,$templateCache,$compile,$http,$rootScope){
  var definition = {
      restrict: 'E',
      replace: true,
      scope: {
        dir:'@',
        receiverUrl:'@',
        clientId:'@',
        template:'@',
        download:'@'
      }    
    };
    definition.link = function postLink(scope, element) {
      scope.show = 'none';
      scope.$watch('dir',function() {
        compile();
        loadResource();
      });
      var compile = function() {
        $http.get(scope.template, { cache: $templateCache }).success(function(html) {
          element.html(html);
          $compile(element.contents())(scope);
        });
      };
      var loadResource=function(){
       scope.loading=true;
       DropboxAPI.getFiles(scope.clientId,scope.receiverUrl,scope.dir,
          function(error,data,stat,statArr){
            if(error){
              console.log("Error reading dropbox files:"+error);
              scope.loading=false;
              return;
            }
            //else set the scope items to the returned object
              scope.items=data;
              scope.statArr=statArr;
              scope.loading=false;
              scope.$apply();
            });
      };
      //handle click event
      scope.levelUp=function()
      {
        var arr=  scope.dir.split("/");
        var path=arr.splice(0,arr.length-2).join("/");
        if(path=="")path="/";
        scope.linkClick(true,path);
      };
      scope.getClass=function(path){
          return 'file '+path.split('.').slice(-1).pop();
      };
      scope.linkClick=function (isfolder,path){
        if(isfolder==true)
        {
          //reload 
          scope.dir=path;
        }
        else{
          //get the file url
          DropboxAPI.getFileUrl(path,scope.download,function(error,shareUrl){
            var arr=shareUrl.url.split("/");
            var name=arr[arr.length-1].split("?")[0];
            $rootScope.$broadcast("dropbox.file",{url:shareUrl.url,name:name,link:scope.$parent.isLink});
          })
        }
      };
    };
    return definition;
}]);


