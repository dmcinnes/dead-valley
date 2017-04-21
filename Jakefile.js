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
task("build", ["clean", "mkdir", "version"], {async: true}, function (params) {
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

  exec('cp favicon.ico build');

  // insert the ad and dump the index in build
  exec('sed -e "/{ad}/r ad.html" -e "/{ad}/d" index.html > build/index.html');

  // set the latest version number for display
  exec('sed -i "s/###/`git describe --abbrev=0 --tags`/" build/index.html');


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

});

desc("create version file");
task("version", ["mkdir"], function (params) {
  exec('git log -1 > build/version.txt');
});

desc("clean up");
task("clean", {async: true}, function (params) {
  console.log('Cleaning...');
  exec('rm -r build', complete);
});

desc("deploy to S3");
task("deploy", {async: true}, function (target) {
  if (target === undefined) {
    console.log('FAIL: Need to specify an S3 target bucket, such as:');
    console.log('      jake deploy[deadvalley2]');
  } else {
    jake.exec(['s3cmd sync --recursive build/ s3://'+target+' --acl-public'],
              {printStdout: true},
              complete);
  }
});
