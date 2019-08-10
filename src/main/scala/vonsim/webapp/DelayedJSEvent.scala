package vonsim.webapp

import scala.scalajs.js.timers.SetTimeoutHandle
import scala.scalajs.js.timers._
import scala.scalajs.js

class DelayedJSEvent(val response: () => Unit) {
  var keystrokes = 0
  val listener: js.Function1[js.Any, js.Any] = (a: js.Any) => keyTyped().asInstanceOf[js.Any]

  def keyTyped() {
    keystrokes += 1
    //      println("keyTyped"+keystrokes)
    setTimeout(500)({ act() })
  }

  def act() {
    keystrokes -= 1
    //      println("act"+keystrokes)
    if (keystrokes == 0) {
      //        println("onchanged"+keystrokes)
      response()
    }
  }
}