package vonsim.webapp
import vonsim.utils.CollectionUtils._
import vonsim.simulator.InstructionInfo
import scalatags.JsDom.all._
import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom
import scala.scalajs.js
import js.JSConverters._
import scala.collection.mutable
import vonsim.simulator.Simulator
import scala.util.Random
import vonsim.simulator
import vonsim.simulator.Flags
import vonsim.simulator.DWord
import vonsim.simulator.Word
import vonsim.simulator.FullRegister
import scalatags.JsDom.all._
import vonsim.simulator.Flag

import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult




class MainboardUI(s: VonSimState) extends VonSimUI(s) {
  val cpuUI = new CpuUI(s)
  val memoryUI = new MemoryUI(s)
//  val ioMemoryUI = new IOMemoryUI(s)
//  val devicesUI = new DevicesUI(s)
  


  val console = pre("").render
  val consoleDir = div(id := "console",
    h2("Console"),
    console).render

  val root = div(id := "mainboard"
        ,div(id := "devices"
        ,cpuUI.root
        ,memoryUI.root
    )).render
    
   def simulatorEvent() {
    memoryUI.simulatorEvent()
    cpuUI.simulatorEvent()
    
    
  }
  def simulatorEvent(i:InstructionInfo) {
    memoryUI.simulatorEvent(i)
    cpuUI.simulatorEvent(i)

  }
  
  def compilationEvent(){
     
  }
  
}

abstract class MainboardItemUI(s: VonSimState,icon:String,itemId:String,title:String) extends VonSimUI(s){
  val contentDiv=div(cls:="mainboardItemContent").render
      
  val root = div(cls:="mainboardItem",
      div(cls:="mainboardItemPreContainer"
      ,div(cls:="mainboardItemContainer",id := itemId
      ,div(cls := "mainboardItemHeader"
        ,img(cls:= "mainboardItemIcon", src := icon)
        ,h2(cls:="mainboardItemHeaderText",title)
      )
      ,contentDiv
      ))
    ).render
  
  def compilationEvent(){
     
  }
}


class MemoryUI(s: VonSimState) extends MainboardItemUI(s,"img/mainboard/ram.png","memory",s.uil.memoryTitle) {

  val body = tbody(id := "memoryTableBody", cls := "clusterize-content").render

  val memoryTable = table(cls:="table-hover"
//    ,thead(th("Address"), th("Value")) 
    ,body).render
  val memoryTableDiv = div(id := "memoryTable", cls := "memoryTable clusterize-scroll",
      memoryTable).render
  
  
  val addressSearchInput=input(cls:="addressSearchInput",maxlength:="4",`type`:="text").render
  
  addressSearchInput.onkeypress = (e:dom.KeyboardEvent) =>{
    val isNumber=(e.charCode>='0' && e.charCode<='9') 
    val isNumericChar = (e.charCode>='a' && e.charCode<='f') || (e.charCode>='A' && e.charCode<='F')
    val isOperation= List(46, 8, 9, 27, 110, 190).contains(e.keyCode)
    val isCutCopyPaste = (e.ctrlKey || e.metaKey) && List(65,67,88).contains(e.keyCode)
    val isNavigation = e.keyCode >= 35 && e.keyCode <= 39    
                 
    val isInput=isNumber || isNumericChar || isOperation || isCutCopyPaste || isNavigation
    if (!isInput){
      e.preventDefault()
      if (e.keyCode==13){
        scrollToAddress()
      }
    }else{
      updateSearchButton()
    }
  }
  def updateSearchButton(){
     val addressString=addressSearchInput.value
    if (addressString.length > 0){
      try{
        val address=  Integer.parseInt(addressString, 16)
        addressSearchButton.classList.remove("disabled") 
      }catch {
        case e:NumberFormatException => addressSearchButton.classList.add("disabled")  
      }
    }else{
      addressSearchButton.classList.add("disabled")
    }
    
  }

  val addressSearchButton=a(cls:="btn btn-primary addressSearchButton",i(cls:="fa fa-search"),
      title:=s.uil.addressSearch).render
  addressSearchButton.onclick = (e: dom.Event) => { scrollToAddress() }
  val addressSearchControls=span(id:="addressSearchControls",addressSearchInput,addressSearchButton)
  val wrapper=div(addressSearchControls,memoryTableDiv)
  contentDiv.appendChild(wrapper.render)

  var stringRows=generateRows().toJSArray
  val clusterizePropsElements = new ClusterizeProps {
    override val rows=Some(stringRows).orUndefined
    override val scrollElem = Some(memoryTableDiv).orUndefined
    override val contentElem = Some(body).orUndefined
  }
  updateSearchButton()
  
  val clusterize = new Clusterize(clusterizePropsElements)
  
  def generateRows()={
    (0 until s.s.memory.values.length).map(generateRow).toArray
  }
  def generateRow(address:Int)={
    val formattedAddress = s.uil.formatAddress(address)
    val value=s.s.memory.values(address)
    val formattedValue = s.uil.formatWord(s.s.memory.values(address))
    val description=s.uil.describeMemoryCell(address, value)
      
      s"""<tr title="$description">  <td class="rowWithTooltip"><span class="memoryTooltip">$description</span>  ${formattedAddress}h </td> <td> ${formattedValue}h  </td> </tr>"""
  }
  
  def addressToId(address:String)={
    s"memory_address_$address"
  }
  def simulatorEvent() {
    stringRows=generateRows().toJSArray
    clusterize.update(stringRows)
  }
  def simulatorEvent(i:InstructionInfo) {
    // TODO
    simulatorEvent()
  }
  def scrollToAddress(){
    
    val addressString=addressSearchInput.value
    if (addressString.length > 0){
      val address=  Integer.parseInt(addressString, 16)
      if (address<s.s.memory.values.length){
        val itemHeight=29 // TODO calculate this value accessing the DOM
        val pixel= 10+address*itemHeight // TODO calculate this magic '10'
        memoryTableDiv.scrollTop=pixel
      }
    }
  }
  

}



