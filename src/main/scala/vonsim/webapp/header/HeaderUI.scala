package vonsim.webapp.header
import vonsim.simulator._
import scalatags.JsDom.all._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.html._
import vonsim.webapp.i18n.UILanguage
import scala.scalajs.js
import scala.scalajs

import scala.scalajs.js.annotation.JSGlobal
import scala.scalajs.js.|.from

import vonsim.webapp.VonSimState
import vonsim.webapp.VonSimUI

abstract class ModalUI(s: VonSimState, modalID: String) extends VonSimUI(s) {
  val root = div(
    cls := "modal fade",
    role := "dialog",
    id := modalID,
    div(
      cls := "modal-dialog",
      div(
        cls := "modal-content",
        div(
          cls := "modal-header",
          getHeader()
        ),
        div(
          cls := "modal-body",
          getBody()
        ),
        div(
          cls := "modal-footer",
          getFooter()
        )
      )
    )
  ).render

  def getHeader(): HTMLElement
  def getBody(): HTMLElement
  def getFooter(): HTMLElement

  def close() {
    import org.querki.jquery._
    $(root).find(".close").click()
  }
}

class HelpUI(s: VonSimState) extends ModalUI(s, "helpModal") {

  def getHeader() = {
    div(
      cls := "modal-header-help",
      img(
        cls := "modal-icon",
        alt := "Von Sim Icon",
        title := s.uil.iconTitle,
        src := "img/icon.png"
//        src := "assets/img/icon.png"
      ),
      h4(
        cls := "modal-title",
        s.uil.pageTitle
      ),
      button(
        `type` := "button",
        cls := "close",
        data("dismiss") := "modal",
        i(cls := "fas fa-close")
      )
    ).render
  }

  def getBody() = {
    div(
      cls := "",
      p(s.uil.pageTitleExtended),
      ul(
        li(
          a(
            cls := "btn btn-link",
            href := "https://github.com/vonsim/vonsim",
            s.uil.helpGithubPage
          )
        ),
        li(
          a(
            cls := "btn btn-link",
            href := "https://github.com/vonsim/vonsim/issues",
            s.uil.helpReportIssue
          )
        )
      ),
      p(s.uil.helpIntendedFor),
      ul(
        li(
          a(
            cls := "btn btn-link",
            href := "http://weblidi.info.unlp.edu.ar/catedras/organiza/",
            "Organización de Computadoras"
          )
        ),
        li(
          a(
            cls := "btn btn-link",
            href := "http://weblidi.info.unlp.edu.ar/catedras/arquitecturaP2003/",
            "Arquitectura de Computadoras"
          )
        ),
        li(
          a(
            cls := "btn btn-link",
            href := "http://weblidi.info.unlp.edu.ar/catedras/ConArqCom/",
            "Conceptos de Arquitectura de Computadoras"
          )
        )
      )
    ).render
  }

  def getFooter() = {
    div(
      cls := "",
      p(
        s.uil.helpMadeBy + " ",
        a(
          style := "color: white",
          href := "http://facundoq.github.io/",
          "Facundo Quiroga"
        ),
        " " + s.uil.and + " ",
        a(
          style := "color: white",
          href := "https://github.com/manuelbb",
          "Manuel Bustos Berrondo"
        ),
        " " + s.uil.helpWithHelpFrom + " ",
        a(
          style := "color: white",
          href := "https://github.com/AndoniZubimendi",
          "Andoni Zubimendi"
        ),
        ", ",
        a(
          style := "color: white",
          href := "https://github.com/cesarares",
          "Cesar Estrebou"
        )
      )
    ).render
  }

  def simulatorEvent() {}

  def simulatorEvent(i: InstructionInfo) {}
  def compilationEvent() {}
}


class LanguageUI(s: VonSimState) extends VonSimUI(s) {
  
  val currentLanguage = s.uil.code
  val languages = UILanguage.codes.keys.filter(_ != currentLanguage)

  val root = div(
		id := "languageButtonContainer",
		cls:= "dropdown-item"
  ).render

  val languageButtons = languages.map(
    l =>
      a(cls := "lang-sm btn language-icon languageButton", attr("lang") := l).render
  )

  languageButtons.foreach(
    button => root.appendChild(button)
  )
  
  
  
   def simulatorEvent() {}

  def simulatorEvent(i: InstructionInfo) {}
  def compilationEvent() {}
}

class DropdownUI(s: VonSimState) extends VonSimUI(s) {
  
    
  val languageUI = new LanguageUI(s)

  def dropdownTutorialItemFactory(tutorialUrl: String, tutorialString: String) = {
    li(
      a(
        cls := "dropdown-item",
        href := "?tutorial="+tutorialUrl,
        tutorialString
      )
    )
  }
  
  val root = div(
    cls := "dropdown dropdown-tutoriales",
    button(
      cls := "btn btn-secondary dropdown-toggle fas fa-bars fa-1x",
      `type` := "button",
      id := "dropdownTutorialButton",
      data("toggle") := "dropdown",
      aria.haspopup := "true",
      aria.expanded := "false",
      span(
        cls := "caret"
      )
    ),
    div(
      cls := "dropdown-menu dropdown-menu-right",
      aria.labelledby := "dropdownTutorialButton",
      li(h1(cls := "dropdown-header",s.uil.tutorials)),
      dropdownTutorialItemFactory("whyassembly", "1. ¿Por que Assembly?"),
      dropdownTutorialItemFactory("vonsim", "2. Sobre VonSim"),
      dropdownTutorialItemFactory("basic", "3. Básico"),
      dropdownTutorialItemFactory("variables", "4. Variables"),
      dropdownTutorialItemFactory("code", "5. Registros e instrucciones"),
      li(role:="separator", cls := "divider"),
      li(h1(cls := "dropdown-header",s.uil.language)),
      li(languageUI.root),
//      li(role:="separator", cls := "divider"),
//      li(h1(cls := "dropdown-header",s.uil.deviceConfigurations)),
//      li(configButtons(0)),
//      li(configButtons(1)),
//      li(configButtons(2)),
      li(role:="separator", cls := "divider"),
      li(
        a(
          cls := "dropdown-item clickable",
          data("toggle") := "modal",
          data("target") := "#helpModal",
          s.uil.aboutus
        )
      )
    )
  ).render
  
   def simulatorEvent() { languageUI.simulatorEvent() }

  def simulatorEvent(i: InstructionInfo) {
    languageUI.simulatorEvent(i)
  }
  def compilationEvent() {}
  
}

class HeaderUI(s: VonSimState) extends VonSimUI(s) {
  
  val controlsUI = new ControlsUI(s)
  val helpUI = new HelpUI(s)
  val dropdownUI = new DropdownUI(s)
    

  val root = div(
  	cls:= "navbar navbar-default",
  	div(
  		cls := "container-fluid",
  		id := "headerControls",
	  	div(
	  		cls := "navbar-header",
	  		button(
//	  			type:="button",
	  			cls:="navbar-toggle collapsed",
		      data("toggle") := "collapse",
		      data("target") := "#navbar-collapse",
	  			attr("aria-expanded") := "false",
	  			span(cls:="sr-only", "Toggle navigation"),
	  			span(cls:="icon-bar"),
	  			span(cls:="icon-bar"),
	  			span(cls:="icon-bar")
	  		),
	  		a(
	  			href := "index.html",
	        img(
	          id := "icon",
	          alt := "Von Sim Icon",
	          title := s.uil.iconTitle,
            src := "img/icon.png"
	        )
	  		)
	  	),
      div(
        id := "help",
        helpUI.root
      ),
	  	div(
	  		cls:= "collapse navbar-collapse",
	  		id:= "navbar-collapse",
	  		ul(
	  			cls:= "nav navbar-nav",
	  			li(span(cls := "controlSection", controlsUI.quickButton)),
			    li(span(cls := "controlSection", controlsUI.loadOrStopButton.root)),
			    li(span(cls := "controlSection", controlsUI.finishButton)),
			    li(span(cls := "controlSection", controlsUI.stepButton)),
			    li(span(cls := "controlSection", controlsUI.simulatorStateUI.root)),
			    li(span(cls := "controlSection", controlsUI.deviceConfigurationUI.root))
	  		),
	  		ul(
	  			cls:= "nav navbar-nav navbar-right",
//	  			li(languageUI.root),
	  			li(dropdownUI.root)
	  		)
	  	) 
  	)
  ).render
   
  
  def disableForQuickRun(){
    controlsUI.disableControlsQuickRun()
    controlsUI.deviceConfigurationUI.disable()
  }
  override def disable() {
    controlsUI.disable()
    controlsUI.deviceConfigurationUI.disable()

    
  }
  override def enable() {
    controlsUI.enable()
    controlsUI.deviceConfigurationUI.enable()

  }

  def simulatorEvent() {
    controlsUI.simulatorEvent()
    dropdownUI.simulatorEvent()
  }

  def simulatorEvent(i: InstructionInfo) {
    controlsUI.simulatorEvent(i)
    dropdownUI.simulatorEvent(i)
  }

  def compilationEvent() {
    controlsUI.compilationEvent()
  }

  def languageButtonBootstrap() = {
    val languages = UILanguage.codes.keys
    val languageList = ul(
      cls := "dropdown-menu",
      attr("aria-labelledby") := "languageButton"
    ).render

    languages.foreach(l => {
      val flag = span(
        cls := "lang-sm language-icon",
        attr("lang") := "es",
        "Spanish"
      ).render
      val languageItem = li(a(href := "#", l)).render
      languageList.appendChild(languageItem)
    })
    val languageButton = div(
      cls := "dropdown",
      id := "languageButtonContainer",
      button(
        cls := "btn btn-secondary dropdown-toggle",
        id := "languageButton",
        `type` := "button",
        data("toogle") := "dropdown",
        attr("aria-haspopup") := "true",
        attr("aria-expanded") := "true"
//	span(cls:="lang-sm language-icon", attr("lang"):="en", "English")
        ,
        "es",
        span(cls := "caret")
      ),
      languageList
    ).render
  }

}
