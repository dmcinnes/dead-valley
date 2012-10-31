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

task("default", ["deploy"]);

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

  // set the latest version number for display
  exec('sed -i "" "s/###/`git describe --abbrev=0 --tags`/" build/index.html');

  var version;

  var cont = function (that) {
    return function (output) {
      console.log(output);
      that();
    };
  };

  seq().seq(function () {

    // get current version
    // awk so it strips the trailing \n
    exec("git log -1 --format=%h  | awk '{ printf $1 }'", this);

  }).par(function (version) {

    req.optimize({
      baseUrl: "./",
      name:    "config",
      out:     "build/config.js",
      wrap: {
        start: "window.DV = {debug:false,version:'"+version+"'};",
        end: " "
      }
    }, cont(this));

  }).par(function () {

    req.optimize({
      baseUrl: "lib",
      name:    "Main",
      out:     "build/lib/Main.js",
      include: include
    }, cont(this));

  }).par(function (version) {

    req.optimize({
      baseUrl: "lib",
      name:    "MapWorker",
      out:     "build/lib/MapWorker.js",
      wrap: {
        start: "var version = '"+version+"'; importScripts('../vendor/underscore-min.js', '../vendor/require.js');",
        end: " "
      }
    }, cont(this));

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
task("deploy", ["build"], function () {
  console.log('Deploying...');
  exec("scp -r build/* everydaylloyd@kramer.dreamhost.com:dv.dougmcinnes.com", complete);
}, true);
