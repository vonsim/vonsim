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
import vonsim.simulator.WordValue
import vonsim.simulator.IntN


import vonsim.simulator.SimulatorProgramExecuting
import vonsim.simulator.SimulatorExecutionStopped
import vonsim.simulator.SimulatorExecutionError
import vonsim.simulator.SimulatorExecutionFinished
import vonsim.assembly.Compiler.CompilationResult

class MainboardUI(s: VonSimState) extends VonSimUI(s) {
	// CPU
  val cpuUI = new CpuUI(s)
  val memoryUI = new MemoryUI(s)
	//val ioMemoryUI = new IOMemoryUI(s)
  
  // Dispositivos internos
  val pioUI = new PioUI(s)
  val handUI = new HandshakeUI(s)
  val picUI = new PicUI(s)
  val cdmaUI = new CdmaUI(s)
  val internalTimerUI = new InternalTimerUI(s)
  
  // Dispositivos externos
  val monitorUI = new MonitorUI(s)
  val keyboardUI = new KeyboardUI(s)
  val keysUI = new KeysUI(s)
  val ledsUI = new LedsUI(s)
  val printerUI = new PrinterUI(s)
//  val externalTimerUI = new ExternalTimerUI(s)
  val f10Button = new F10Button(s)
  
//	for(i <- 0 to 7) {
//		keysUI.inputArray(i).onclick = (e: Any) => {
//			keysUI.toggleBit(i)
//			pioUI.simulatorEvent()
//		}
//  }
  
  val console = pre("").render
  val consoleDir = div(id := "console", h2("Console"), console).render

  val root = div(
    id := "mainboard",
    ul(
      cls := "nav nav-tabs",
      role := "tablist",
      li(
        role :="presentation",
        cls:="active",
        id:="cpu-tab",
        a(
          href:="#cpu",
          role:="tab",
          data("toggle") := "tab",
          aria.controls := "cpu",
          "CPU"
        )
      ),
      li(
        role :="presentation",
        id:="internal-devices-tab",
        a(
          href:="#internalDevices",
//          id:="internal-devices-tab",
          role:="tab",
          data("toggle") := "tab",
          aria.controls := "internalDevices",
          s.uil.internalDevicesTitle
        )
      ),
      li(
        role :="presentation",
        id:="external-devices-tab",
        a(
          href:="#externalDevices",
//          id:="external-devices-tab",
          role:="tab",
          data("toggle") := "tab",
          aria.controls := "externalDevices",
          s.uil.externalDevicesTitle
        )
      )
    ),
    div(
      cls := "tab-content",
      div(
        role := "tabpanel",
        cls := "tab-pane fade in active",
//        cls := "tab-pane fade",
        id := "cpu",
        cpuUI.root,
        memoryUI.root
//        div(cls:="col-md-4", cpuUI.root),
//        div(cls:="col-md-4", memoryUI.root)
      ),
      div(
        role := "tabpanel",
        cls := "tab-pane fade",
        id := "internalDevices",
        pioUI.root,
        handUI.root,
        picUI.root,
        cdmaUI.root,
        internalTimerUI.root
      ),
      div(
        role := "tabpanel",
//        cls := "tab-pane fade in active",
        cls := "tab-pane fade",
        id := "externalDevices",
        monitorUI.root,
        keyboardUI.root,
        keysUI.root,
        ledsUI.root,
        printerUI.root,
//        externalTimerUI.root,
        f10Button.root
      )
    )
  ).render
  
  changeDisplayConfiguration(0)
  
  def changeDisplayConfiguration(config: Int) {
  	config match {
  		case 0 => {
        pioUI.show()
        ledsUI.show()
        keysUI.show()
        
        handUI.hide()
        cdmaUI.hide()
        printerUI.hide()
  		}
  		case 1 => {
  			pioUI.show()
        printerUI.show()
        
        handUI.hide()
        cdmaUI.hide()
        keysUI.hide()
        ledsUI.hide()
  		}
  		case 2 => {
  			handUI.show()
        printerUI.show()
        
        pioUI.hide()
        cdmaUI.hide()
        keysUI.hide()
        ledsUI.hide()
  		}
  		case 3 => {
  			handUI.show()
        printerUI.show()
  			cdmaUI.show()
  			
        pioUI.hide()
        keysUI.hide()
        ledsUI.hide()
  		}
  	}
  }

  def simulatorEvent() {
    memoryUI.simulatorEvent()
    cpuUI.simulatorEvent()
    
    monitorUI.simulatorEvent()
		keyboardUI.simulatorEvent()
		f10Button.simulatorEvent()
		picUI.simulatorEvent()
		internalTimerUI.simulatorEvent()

    s.s.devController.getConfig() match {
      case 0 => {
    		keysUI.simulatorEvent()
    		ledsUI.simulatorEvent()
    		pioUI.simulatorEvent()
      }
      case 1 => {
        printerUI.simulatorEvent()
        pioUI.simulatorEvent()
      }
      case 2 => {
        printerUI.simulatorEvent()
        handUI.simulatorEvent()
      }
      case 3 => {
        printerUI.simulatorEvent()
        handUI.simulatorEvent()
        cdmaUI.simulatorEvent()
      }
    }
  }
  def simulatorEvent(i: InstructionInfo) {
    memoryUI.simulatorEvent(i)
    cpuUI.simulatorEvent(i)

    monitorUI.simulatorEvent(i)
		keyboardUI.simulatorEvent(i)
		f10Button.simulatorEvent(i)
		picUI.simulatorEvent(i)
		internalTimerUI.simulatorEvent(i)

    s.s.devController.getConfig() match {
      case 0 => {
    		keysUI.simulatorEvent(i)
    		ledsUI.simulatorEvent(i)
    		pioUI.simulatorEvent(i)
      }
      case 1 => {
        printerUI.simulatorEvent(i)
        pioUI.simulatorEvent(i)
      }
      case 2 => {
        printerUI.simulatorEvent(i)
        handUI.simulatorEvent(i)
      }
      case 3 => {
        printerUI.simulatorEvent(i)
        handUI.simulatorEvent(i)
        cdmaUI.simulatorEvent(i)
      }
    }
  }

  def compilationEvent() {}

  def reset() {
    monitorUI.reset()
    keyboardUI.reset()
    keysUI.reset()
    printerUI.reset()
  }
}

abstract class MainboardItemUI(
  s: VonSimState,
  icon: String,
  itemId: String,
  title: String
) extends VonSimUI(s) {
  val contentDiv = div(cls := "mainboardItemContent").render
  val devicesWithButtons = Array("CpuUI", "PrinterUI")

  val speedUpButton = div(cls:="pull-right").render
  val root = div(
    cls := "mainboardItem",
    div(
      cls := "mainboardItemPreContainer",
      div(
        cls := "mainboardItemContainer",
        id := itemId,
        div(
          cls := "mainboardItemHeader",
          //img(cls := "mainboardItemIcon", src := "assets/"+icon),
      		//i(cls := "fas fa-"+icon),
          h2(cls := "mainboardItemHeaderText pull-left fas fa-"+icon, " "+title),
          if (devicesWithButtons.contains(this.getClass.getSimpleName)) speedUpButton.render
        ),
        contentDiv
      )
    )
  ).render

  def compilationEvent() {}
}

class MemoryUI(s: VonSimState)
    extends MainboardItemUI(
      s,
      "memory",
      "memory",
      s.uil.memoryTitle
    ) {

  val body = tbody(id := "memoryTableBody", cls := "clusterize-content").render

  val memoryTable = table(
    cls := "table-hover"
//    ,thead(th("Address"), th("Value"))
    ,
    body
  ).render
  val memoryTableDiv = div(
    id := "memoryTable",
    cls := "memoryTable clusterize-scroll",
    memoryTable
  ).render

  val addressSearchInput = input(
    cls := "addressSearchInput",
    maxlength := "4",
    `type` := "text"
  ).render

  addressSearchInput.onkeypress = (e: dom.KeyboardEvent) => {
    val isNumber = (e.charCode >= '0' && e.charCode <= '9')
    val isNumericChar = (e.charCode >= 'a' && e.charCode <= 'f') || (e.charCode >= 'A' && e.charCode <= 'F')
    val isOperation = List(46, 8, 9, 27, 110, 190).contains(e.keyCode)
    val isCutCopyPaste = (e.ctrlKey || e.metaKey) && List(65, 67, 88).contains(
      e.keyCode
    )
    val isNavigation = e.keyCode >= 35 && e.keyCode <= 39

    val isInput = isNumber || isNumericChar || isOperation || isCutCopyPaste || isNavigation
    if (!isInput) {
      e.preventDefault()
      if (e.keyCode == 13) {
        scrollToAddress()
      }
    } else {
      updateSearchButton()
    }
  }
  def updateSearchButton() {
    val addressString = addressSearchInput.value
    if (addressString.length > 0) {
      try {
        val address = Integer.parseInt(addressString, 16)
        addressSearchButton.classList.remove("disabled")
      } catch {
        case e: NumberFormatException =>
          addressSearchButton.classList.add("disabled")
      }
    } else {
      addressSearchButton.classList.add("disabled")
    }

  }

  val addressSearchButton = a(
    cls := "btn btn-primary addressSearchButton",
    i(cls := "fa fa-search"),
    title := s.uil.addressSearch
  ).render
  addressSearchButton.onclick = (e: dom.Event) => { scrollToAddress() }
  val addressSearchControls =
    span(id := "addressSearchControls", addressSearchInput, addressSearchButton)
  val wrapper = div(addressSearchControls, memoryTableDiv)
  contentDiv.appendChild(wrapper.render)

  var stringRows = generateRows()
  val clusterizePropsElements = new ClusterizeProps {
    override val rows = Some(stringRows).orUndefined
    override val scrollElem = Some(memoryTableDiv).orUndefined
    override val contentElem = Some(body).orUndefined
  }
  updateSearchButton()

  val clusterize = new Clusterize(clusterizePropsElements)

  def generateRows() = (0 until s.s.memory.values.length).map(generateRow).toJSArray
  def updateRows() {
    s.s.memory.getChangedAddresses().foreach(address => stringRows(address) = generateRow(address))
  }
  def generateRow(address: Int) = {
    val formattedAddress = s.uil.formatAddress(address)
    val value = s.s.memory.values(address)
    val formattedValue = s.uil.formatWord(s.s.memory.values(address))
    val description = s.uil.describeMemoryCell(address, value)

    s"""<tr title="$description">  <td class="rowWithTooltip"><span class="memoryTooltip">$description</span>  ${formattedAddress}h </td> <td> ${formattedValue}h  </td> </tr>"""
  }

  def addressToId(address: String) = {
    s"memory_address_$address"
  }
  def simulatorEvent() {
    updateRows()
    clusterize.update(stringRows)
  }
  def simulatorEvent(i: InstructionInfo) {
    simulatorEvent()
  }
  def scrollToAddress() {

    val addressString = addressSearchInput.value
    if (addressString.length > 0) {
      val address = Integer.parseInt(addressString, 16)
      if (address < s.s.memory.values.length) {
        val itemHeight = 29 // TODO calculate this value accessing the DOM
        val pixel = 10 + address * itemHeight // TODO calculate this magic '10'
        memoryTableDiv.scrollTop = pixel
      }
    }
  }

}
