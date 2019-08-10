package vonsim.webapp

import scala.scalajs.js
import org.scalajs.dom.raw.HTMLDocument
import scala.scalajs.js.annotation.JSGlobalScope
import org.scalajs.dom.raw.Element
import scala.scalajs.js.annotation.ScalaJSDefined

@js.native
//@JSGlobalScope
class Clusterize(p:ClusterizeProps) extends js.Object {
  
  def destroy(b:Boolean=false): Unit = js.native
  def clear(): Unit = js.native
  def getScrollProgress(): Int = js.native
  def getRowsAmount(): Int = js.native
  
  def update(a:js.Array[String]):Unit = js.native
  def append(a:js.Array[String]):Unit = js.native
  def prepend(a:js.Array[String]):Unit = js.native
  def refresh(b:Boolean=false): Unit = js.native
}

@ScalaJSDefined
trait ClusterizeCallbacksProps extends js.Object {
  val clusterWillChange: js.UndefOr[js.Function0[Unit]] = js.undefined
  val clusterChanged: js.UndefOr[js.Function0[Unit]] = js.undefined
  val scrollingProgress: js.UndefOr[js.Function1[Int,Unit]] = js.undefined
}

@ScalaJSDefined
trait ClusterizeProps extends js.Object {
  val rows: js.UndefOr[js.Array[String]] = js.undefined
  val scrollId: js.UndefOr[String ] = js.undefined
  val contentId: js.UndefOr[String ] = js.undefined
  val scrollElem: js.UndefOr[Element] = js.undefined
  val contentElem: js.UndefOr[Element] = js.undefined
  val show_no_data_row: js.UndefOr[Boolean] = js.undefined
  val tag: js.UndefOr[String ] = js.undefined
  val rows_in_block: js.UndefOr[Int] = js.undefined
  val blocks_in_cluster: js.UndefOr[Int] = js.undefined
  val no_data_text: js.UndefOr[String ] = js.undefined
  val no_data_class: js.UndefOr[String ] = js.undefined
  val keep_parity: js.UndefOr[Boolean] = js.undefined
  val callbacks: js.UndefOr[ClusterizeCallbacksProps] = js.undefined
}