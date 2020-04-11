package vonsim.webapp
import vonsim.simulator._
import scalatags.JsDom.all._
import vonsim.assembly.Compiler.CompilationResult
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.html._
import vonsim.webapp.i18n.UILanguage

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
        // src := "img/icon.png"
       src := "assets/img/icon.png"
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
      p(
        a(
          cls := "btn btn-success",
          href := "https://github.com/facundoq/vonsim",
          s.uil.helpGithubPage
        ),
        a(
          cls := "btn btn-success",
          href := "https://github.com/facundoq/vonsim/issues",
          s.uil.helpReportIssue
        )
      ),
      p(s.uil.helpIntendedFor),
      p(
        a(
          cls := "btn btn-success",
          href := "http://weblidi.info.unlp.edu.ar/catedras/organiza/",
          "Organización de Computadoras"
        ),
        a(
          cls := "btn btn-success",
          href := "http://weblidi.info.unlp.edu.ar/catedras/arquitecturaP2003/",
          "Arquitectura de Computadoras"
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
          cls := "btn btn-primary",
          href := "https://github.com/facundoq/",
          "Facundo Quiroga"
        ),
        " " + s.uil.helpWithHelpFrom + " ",
        a(
          cls := "btn btn-primary",
          href := "https://github.com/AndoniZubimendi",
          "Andoni Zubimendi"
        ),
        " " + s.uil.and + " ",
        a(
          cls := "btn btn-primary",
          href := "https://github.com/cesarares",
          "Cesar Estrebou"
        )
      ),
      p(s.uil.helpFeedbackWelcome + " f<last name> (at) gmail.com")
    ).render
  }

  def simulatorEvent() {}

  def simulatorEvent(i: InstructionInfo) {}
  def compilationEvent() {}
}

class HeaderUI(s: VonSimState) extends VonSimUI(s) {
  val controlsUI = new ControlsUI(s)

  val helpUI = new HelpUI(s)

  val helpUIButton = span(
    id := "help",
    a(
      cls := "helpButton",
      data("toggle") := "modal",
      data("target") := "#helpModal",
      i(cls := s"fas fa-question-circle")
    ),
    helpUI.root
  ).render
  val currentLanguage = s.uil.code
  val languages = UILanguage.codes.keys.filter(_ != currentLanguage)

  val languageButtonsContainer = div(
		id := "languageButtonContainer"
  ).render

  val languageButtons = languages.map(
    l =>
      a(cls := "lang-sm btn language-icon languageButton", attr("lang") := l).render
  )

  languageButtons.foreach(
    button => languageButtonsContainer.appendChild(button)
  )
  
  val configButtons = Array.apply(
		dropdownConfigurationItemFactory(0, "PIO + Llaves y leds").render,
		dropdownConfigurationItemFactory(1, "PIO + Impresora").render,
		dropdownConfigurationItemFactory(2, "Handshake + Impresora").render,
		dropdownConfigurationItemFactory(3, "Handshake y CDMA + Impresora").render
  )

  def dropdownConfigurationItemFactory(conf: Int, tooltip: String) = {
    a(
      cls := "dropdown-item clickable",
      data("toggle"):="tooltip",
      data("placement"):="bottom",
      title:= tooltip,
      "Configuración " + conf
    )
  }

  val tutorialDropdown = div(
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
      dropdownTutorialItemFactory("whyassembly", "1. ¿Por que Assembly?"),
      dropdownTutorialItemFactory("vonsim", "2. Sobre VonSim"),
      dropdownTutorialItemFactory("basic", "3. Básico"),
      dropdownTutorialItemFactory("variables", "4. Variables"),
      dropdownTutorialItemFactory("code", "5. Registros e instrucciones"),
      li(role:="separator", cls := "divider"),
      li(configButtons(0)),
      li(configButtons(1)),
      li(configButtons(2)),
      li(configButtons(3))
    )
  ).render

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
	          // src := "img/icon.png"
	          src := "assets/img/icon.png"
	        )
	  		)
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
			    li(span(cls := "controlSection", controlsUI.simulatorStateUI.root))
	  		),
	  		ul(
	  			cls:= "nav navbar-nav navbar-right",
	  			li(languageButtonsContainer),
	  			li(tutorialDropdown)
	  		)
	  	) 
  	)
  ).render
  
//  val root = header(
//  	div(
//      id := "headerControls",
//      a(
//        href := "index.html",
//        img(
//          id := "icon",
//          alt := "Von Sim Icon",
//          title := s.uil.iconTitle,
//          src := "img/icon.png"
////          src := "assets/img/icon.png"
//        )
//      ),
//      controlsUI.root,
//      span(id := "headerSeparator"),
//      // tutorialDropdown,
//      languageButtonsContainer,
//      //, helpUIButton
//      div(
//        id := "headerOptions",
//        languageButtonsContainer,
//        tutorialDropdown
//      )
//  	)
//  ).render

  def disableConfigButtons() {
    configButtons.foreach(configButton => {
      configButton.classList.remove("clickable")
      configButton.classList.add("non-clickable")
    })
  }
  def enableConfigButtons() {
    configButtons.foreach(configButton => {
      configButton.classList.remove("non-clickable")
      configButton.classList.add("clickable")
    })
  }

  override def disable() = controlsUI.disable()
  override def enable() = controlsUI.enable()

  def simulatorEvent() {
    controlsUI.simulatorEvent()
  }

  def simulatorEvent(i: InstructionInfo) {
    controlsUI.simulatorEvent(i)
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
