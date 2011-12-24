var fs   = require("fs"),
    path = require("path"),
    _    = require("underscore"),
    req  = require("requirejs");

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

  var config = {
    baseUrl: "lib",
    name:    "Main",
    out:     "build/lib/Main.js",
    include: include,
    skipModuleInsertion: true
  };

  // _.each(['assets', 'stylesheets', 'vendor'], function (dir) {
  //   sys.copyFileSync(dir, 'build');
  // });

  // sys.copyFileSync('index.html', 'build');

  req.optimize(config, complete);
}, true);


desc("clean up");
task("clean", [], function (params) {
  fs.rmdir("build", complete);
}, true);
