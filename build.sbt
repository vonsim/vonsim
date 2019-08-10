enablePlugins(ScalaJSPlugin)

name := "VonSim"

scalaVersion := "2.11.6"


resolvers += "amateras-repo" at "http://amateras.sourceforge.jp/mvn/"
resolvers += "Artima Maven Repository" at "http://repo.artima.com/releases"


libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.9.1"
libraryDependencies += "com.lihaoyi" %%% "scalatags" % "0.6.2"
libraryDependencies += "org.scalatest" %%% "scalatest" % "3.0.0" % "test"
libraryDependencies += "org.scala-lang.modules" %%% "scala-parser-combinators" % "1.0.5"

libraryDependencies += "com.scalawarrior" %%% "scalajs-ace" % "0.0.4"
//libraryDependencies += "be.doeraene" %%% "scalajs-jquery" % "0.9.2"
libraryDependencies += "org.querki" %%% "jquery-facade" % "1.2"
libraryDependencies += "org.scalatest" %%% "scalatest" % "3.0.0" % "test"

//libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.1"
//libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.1" % "test"
