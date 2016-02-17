'use script';

var gulp = require('gulp');
var webserver = require('gulp-webserver');
//the two gulp modules added to handle 2 different build definitions (dev, prod)
var replace = require('gulp-replace');
var env = require('gulp-env');
//end of build definitions addition
var fs = require('fs');
var minimist = require('minimist');
var xmllint = require('xmllint');
var chalk = require('chalk');
var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('help', $.taskListing.withFilters(function(task) {
	var mainTasks = ['default', 'help', 'serve-static', 'validate-xml','build'];
  var isSubTask = mainTasks.indexOf(task) < 0;
	return isSubTask;
}));
gulp.task('default', ['help']);

gulp.task('serve-static', function(){
  gulp.src('.')
    .pipe(webserver({
      https: true,
      port: '8443',
      host: 'localhost',
      directoryListing: true,
      fallback: 'index.html'
    }));
});

gulp.task('validate-xml', function () {
  var options = minimist(process.argv.slice(2));
  var xsd = fs.readFileSync('./manifest.xsd');
  var xmlFilePath = options.xmlfile || './manifest.xml';
  var resultsAsJson = options.json || false;
  var xml = fs.readFileSync(xmlFilePath);
  
  validateHighResolutionIconUrl(xml, result);
  
  if (!resultsAsJson) {
    console.log('\nValidating ' + chalk.blue(xmlFilePath.substring(xmlFilePath.lastIndexOf('/')+1)) + ':');
  } 
  var result = xmllint.validateXML({
    xml: xml,
    schema: xsd
  });
  
  if (resultsAsJson) {
    console.log(JSON.stringify(result));
  }
  else {
    if (result.errors === null) {
      console.log(chalk.green('Valid'));
    }
    else {
      console.log(chalk.red('Invalid'));
      result.errors.forEach(function(e) {
        console.log(chalk.red(e));
      });
    }
  }
});

function validateHighResolutionIconUrl(xml, result) {
  if (xml && result) {
    var xmlString = xml.toString();    
    
    if (xmlString.indexOf('<HighResolutionIconUrl ') > -1 &&
      xmlString.indexOf('<HighResolutionIconUrl DefaultValue="https://') < 0) {
        if (result.errors === null) {
          result.errors = [];
        }
        
        result.errors.push('The value of the HighResolutionIconUrl attribute contains an unsupported URL. You can only use https:// URLs.');
    }
  }
}
//add tasks for build definitions
gulp.task('set-env-dev',function(){
    env({
          vars: {
              ADDIN_URL:"https://localhost:8443"
          }
        });
});
gulp.task('set-env-prod',function(){
    env({
          vars: {
              ADDIN_URL:"https://outlookimport.azurewebsites.net"
          }
        });
});
gulp.task('build',function(){
  var url=process.env['ADDIN_URL'];
  gulp.src('manifest.xml')
    .pipe(replace('SITE_URL',url))
    .pipe(gulp.dest('build'));
});
//two different build definitions tasks
gulp.task('build-dev',['set-env-dev','build']);
gulp.task('build-prod',['set-env-prod','build']);

