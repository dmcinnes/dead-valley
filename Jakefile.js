var fs   = require("fs"),
    path = require("path"),
    _    = require("underscore"),
    req  = require("requirejs"),
    seq  = require("seq"),
    child_process = require("child_process"),
    exec = child_process.exec;
    

var recurseDir = function (dir) {
  var out = [];
  var list = fs.readdirSync(dir);
  for (var i = 0; i < list.length; i++) {
    var file = list[i];
    var fullname = path.join(dir, file);
    if (fs.statSync(fullname).isDirectory()) {
      var child = recurseDir(fullname);
      for (var j = 0; j < child.length; j++) {
        out.push(child[j]);
      }
    } else {
      out.push(fullname);
    }
  }
  return out;
};

task("default", ["build", "deploy"]);

desc("create build directory");
task("mkdir", ["clean"], function (params) {
  fs.mkdirSync('build');
  fs.mkdirSync('build/lib');
});

desc("build the project");
task("build", ["clean", "mkdir", "version"], function (params) {
  console.log('Buliding...');

  var libFiles = _.union(recurseDir('lib/inventory'), recurseDir('lib/sprites'));

  var include = _.map(libFiles, function (file) {
    var name     = path.basename(file, '.js');
    var filename = [path.dirname(file), name].join('/').slice(4);
    return filename;
  });

  _.each(['assets', 'stylesheets', 'vendor', 'maps'], function (dir) {
    exec(['cp -r', dir, 'build/'+dir].join(' '));
  });

  exec('cp index.html build');
  exec('cp favicon.ico build');

  var version;

  seq().seq(function () {

    var that = this;
    exec('git log -1 --format=%h', function (error, stdout) {
      version = stdout.trim();
      that();
    });

  }).par(function () {

    req.optimize({
      baseUrl: "./",
      name:    "config",
      out:     "build/config.js",
      wrap: {
        start: "window.DV = {debug:false,version:'"+version+"'};",
        end: " "
      }
    }, this);

  }).par(function () {

    req.optimize({
      baseUrl: "lib",
      name:    "Main",
      out:     "build/lib/Main.js",
      include: include
    }, this);

  }).par(function () {

    req.optimize({
      baseUrl: "lib",
      name:    "MapWorker",
      out:     "build/lib/MapWorker.js",
      wrap: {
        start: "var version = '"+version+"'; importScripts('../vendor/underscore-min.js', '../vendor/require.js');",
        end: " "
      }
    }, this);

  }).seq(complete);

}, true);

desc("create version file");
task("version", ["mkdir"], function (params) {
  exec('git log -1 > build/version.txt');
});

desc("clean up");
task("clean", function (params) {
  console.log('Cleaning...');
  exec('rm -r build', complete);
}, true);

desc("deploy to test env");
task("deploy", function () {
  console.log('Deploying...');
  exec("scp -r build/* everydaylloyd@kramer.dreamhost.com:dv.dougmcinnes.com", complete);
}, true);
