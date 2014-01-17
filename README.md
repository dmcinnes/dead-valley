Dead Valley
===========

Escape from Zombie-infested Dead Valley in this HTML5 Grand Theft Auto style Game.

The full game is hosted here:
http://www.deadvalleygame.com

Dependent Libraries (Found in *vendor/*)

* [jQuery](http://jquery.com/)
* [Requirejs](http://requirejs.org/)
* [Underscore.js](http://documentcloud.github.com/underscore/)
* [Soundjs](http://www.createjs.com/#!/SoundJS)
* [Modernizr](http://modernizr.com/)

Development
-----------

Opening index.html locally in a browser will not work; you will need to set up a web server. I recommend using [Pow](http://pow.cx/) on a mac. It needs a public directory to host static files so just create a symlink:
```
ln -s . public
```
It's already in the .gitignore file.

Tests!
-----

There's a suite of Jasmine tests in the *test/* directory that put some aspects of the game through their paces. The coverage is spotty and the test code is kind of ratty but at least it exists.

Drag this [Test Runner Bookmarklet](javascript:$.getScript("test/runner.js");) to your browser bar.

Reload the game then click on the bookmarklet to run the tests.

License
-------
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Dead Valley</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://dougmcinnes.com" property="cc:attributionName" rel="cc:attributionURL">Doug McInnes</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.
