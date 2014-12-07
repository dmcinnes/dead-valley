Dead Valley
===========

Escape from Zombie-infested Dead Valley in this HTML5 Grand Theft Auto style Game.

The full game is hosted here:
http://www.deadvalleygame.com



### Running the Game

Opening index.html locally in a browser will not work; you will need to set up a web server. I recommend using [Pow](http://pow.cx/) on a mac. It needs a public directory to host static files so just create a symlink:
```
ln -s . public
```
It's already in the .gitignore file.

### Code

Dead Valley uses [Requirejs](http://requirejs.org/) for code organization.

Required Libraries (Found in *vendor/*)

* [jQuery](http://jquery.com/)
* [Requirejs](http://requirejs.org/)
* [Underscore.js](http://documentcloud.github.com/underscore/)
* [Soundjs](http://www.createjs.com/#!/SoundJS)
* [Modernizr](http://modernizr.com/)

### Editor

The maps are JSON in the *maps/* directory.

There is an HTML5 map editor **editor.html**.
Select tiles on the left, and place them with a click. Free draw with the shift key. The red highlighted tiles in the map are the only places roads should leave the map.

There used to be a way to place full buildings, complete with defined walls and entrances (Building Archetypes) but that seems broken.

### Branches

The "master" branch is what's currently hosted on http://www.deadvalleygame.com

The "standalone" branch has the most up to date code -- all of the Sprite and Inventory classes have had their view and data centered code split to make future development easier.

### Tests

There's a suite of Jasmine tests in the *test/* directory that put some aspects of the game through their paces. The coverage is spotty and the test code is kind of ratty but at least it exists.

Drag this to your browser bar: <a href="javascript:$.getScript('test/runner.js');">Test Runner Bookmarklet</a>

Reload the game then click on the bookmarklet to run the tests.

License
-------
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Dead Valley</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://dougmcinnes.com" property="cc:attributionName" rel="cc:attributionURL">Doug McInnes</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.
