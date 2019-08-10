# Contributing

Pull requests should be made directly against the `master` branch.

Check the [vonsim development docs](doc/index.md).

## Setup for development

* Clone the repo to FOLDER
* Install `scala` (version >= `2.11.6`) and `sbt` (version >= `0.13`)
* Navigate to FOLDER. Execute `sbt`. sbt should fire up, downloading a bunch of stuff (dependencies, plugins, etc).
* To run tests, execute `test` in the sbt prompt. `testQuick` does not rerun succesfull tests.
* To compile the app for development, execute `fastOptJS` from the sbt prompt. This will generate the necessary js code in `FOLDER/target/scala-2.11/vonsim-fastopt.js`. 
* If you add a `~` to an sbt command, it will watch for file changes in the project, and recompile when necessary. You will probably want to use `~fastOptJS` when testing the app and `~testQuick` when writing/debugging tests.
* To execute the app open `FOLDER/assets/index.html` with a browser. `index.html` loads `vonsim-fastopt.js` and starts up the app. You can fire up a webserver to serve the contents or just use the `file://` protocol.
* I recommend using a browser plugin that reloads static content when it changes, so that the app reloads automatically when the code compiles.


##  Deployment

To compile the app for deployment, execute `fullOptJS` from the sbt prompt. This will also generate the necesary js code but in file `FOLDER/target/scala-2.11/vonsim-fullopt.js`. This js file will be optimized, both in size and execution speed. 

The file `FOLDER/assets/index.html` points to `vonsim-fastopt.js` instead of `vonsim-fullopt.js`. To deploy, copy the entire assets folder, along with the `vonsim-fullopt.js` file to a webserver. Then, modify `assets/index.html` so that it loads `vonsim-fullopt.js` instead of `vonsim-fastopt.js` (just change the reference in the `<script>` element).


## Scala IDE for Eclipse

You can use the [Scala IDE for Eclipse](http://scala-ide.org/), which provides syntax highlighting, code completion and error checking. Steps:

* Download and extract ScalaIDE
* From the sbt prompt, execute `eclipse`. the sbtclipse plugin will generate the necessary eclipse project files.
* Note that the `.gitignore` is set to ignore eclipse configuration files, so these *should not* be pushed to the main repo.
* Open ScalaIDE (use the eclipse executable). 
* Use `File -> Import`, `Existing Projects Into Workspace`. Then select the `FOLDER` folder and `Finish`. 
* Wait for a while for eclipse to finish analysing the project. 
* There will be a couple of project errors because Eclipse detects a different version of the compiler used for some libraries. You can safely ignore these since the actual build is done by `sbt`, so you will be using Eclipse just for the code completion, etc.
* Note: Whenever a new plugin or dependency is added, the `eclipse` sbt command needs to be executed again.


