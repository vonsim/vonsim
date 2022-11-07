enablePlugins(ScalaJSPlugin)

name := "VonSim"

scalaVersion := "2.11.6"

resolvers += "amateras-repo" at "https://amateras.osdn.jp/mvn"
resolvers += "Artima Maven Repository" at "http://repo.artima.com/releases"


// SJS dependencies
libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.9.1"
libraryDependencies += "com.lihaoyi" %%% "scalatags" % "0.6.2"
libraryDependencies += "org.scala-lang.modules" %%% "scala-parser-combinators" % "1.0.5"
libraryDependencies += "com.scalawarrior" %%% "scalajs-ace" % "0.0.4"
libraryDependencies += "org.querki" %%% "jquery-facade" % "1.2"


// Pure scala dependencies
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.0" % "test"