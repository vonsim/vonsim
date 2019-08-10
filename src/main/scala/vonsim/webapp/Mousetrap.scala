package vonsim.webapp

import scala.scalajs.js
import org.scalajs.dom.raw.HTMLDocument
import scala.scalajs.js.annotation.JSGlobalScope
import org.scalajs.dom.raw.Element
import scala.scalajs.js.annotation.ScalaJSDefined

@js.native
object Mousetrap extends js.Object {
  def bind(key:String,f:js.Function0[Boolean],event:String="keyup"):Unit = js.native
//  def bind(key:js.Array[String],f:Function0[Boolean],event:String="keyup"):Unit = js.native
  def bindGlobal(key:String,f:js.Function0[Boolean],event:String="keyup"):Unit = js.native
  def unbind(key:String):Unit = js.native
  def trigger(key:String):Unit = js.native
  def reset():Unit = js.native

}

