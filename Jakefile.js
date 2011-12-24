var fs   = require("fs"),
    path = require("path"),
    _    = require("underscore"),
    req  = require("requirejs"),
    child_process = require( "child_process" ),
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

task("default", ["build"]);

desc("build the project");
task("build", [], function (params) {
  var libFiles = _.union(recurseDir('lib/inventory'), recurseDir('lib/sprites'));

  var include = _.map(libFiles, function (file) {
    var name     = path.basename(file, '.js');
    var filename = [path.dirname(file), name].join('/').slice(4);
    return filename;
  });


  fs.mkdirSync('build');
  fs.mkdirSync('build/lib');

  _.each(['assets', 'stylesheets', 'vendor', 'maps'], function (dir) {
    exec(['cp -r', dir, 'build/'+dir].join(' '));
  });

  _.each(['MapWorker', 'TileMarshal', 'section-list', 'car-list'], function (file) {
    exec('cp lib/'+file+'.js build/lib');
  });

  exec('cp index.html build');

  req.optimize({
    baseUrl: "lib",
    name:    "Main",
    out:     "build/lib/Main.js",
    include: include,
    skipModuleInsertion: true
  }, complete);

}, true);


desc("clean up");
task("clean", [], function (params) {
  exec('rm -r build');
}, true);
