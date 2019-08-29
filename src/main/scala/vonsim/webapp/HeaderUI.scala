package vonsim.webapp
import vonsim.simulator._
import scalatags.JsDom.all._
import vonsim.assembly.Compiler.CompilationResult
import org.scalajs.dom.raw.HTMLElement
import vonsim.webapp.i18n.UILanguage

abstract class ModalUI(s: VonSimState, modalID: String) extends VonSimUI(s) {
  val root = div(
    cls := "modal fade",
    role := "dialog",
    id := modalID,
//		style := "display:none",
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

  val languageButtonsContainer = div(id := "languageButtonContainer").render

  val languageButtons = languages.map(
    l =>
      a(cls := "lang-sm btn language-icon languageButton", attr("lang") := l).render
  )

  languageButtons.foreach(
    button => languageButtonsContainer.appendChild(button)
  )

  val tutorialDropdown = div(
    cls := "dropdown dropdown-tutoriales",
    button(
      cls := "btn btn-secondary dropdown-toggle fas fa-bars fa-1x",
      `type` := "button",
      id := "dropdownTutorialButton",
      data("toggle") := "dropdown",
      aria.haspopup := "true",
      aria.expanded := "false",
//      "Tutoriales",
//      i(cls:= "fas fa-ellipsis-v"),
      span(
        cls := "caret"
      )
    ),
    div(
      cls := "dropdown-menu dropdown-menu-right",
      aria.labelledby := "dropdownTutorialButton",
      dropdownItemFactory("whyassembly", "1. ¿Por que Assembly?"),
      dropdownItemFactory("vonsim", "2. Sobre VonSim"),
      dropdownItemFactory("basic", "3. Básico"),
      dropdownItemFactory("variables", "4. Variables"),
      dropdownItemFactory("code", "5. Registros e instrucciones")
    )
  ).render

  val root = header(
  	div(
      id := "headerControls",
      a(
        href := "index.html",
        img(
          id := "icon",
          alt := "Von Sim Icon",
          title := s.uil.iconTitle,
          src := "img/icon.png"
//          src := "assets/img/icon.png"
        )
      ),
      controlsUI.root,
      span(id := "headerSeparator"),
      // tutorialDropdown,
      languageButtonsContainer,
      //, helpUIButton
      div(
        id := "headerOptions",
        languageButtonsContainer,
        tutorialDropdown
      )
  	)
  ).render

  def dropdownItemFactory(tutorialUrl: String, tutorialString: String) = {
    li(
      a(
        cls := "dropdown-item",
        href := "?tutorial="+tutorialUrl,
        tutorialString
      )
    )
  }

  def disableControls() {}
  override def disable() {
    controlsUI.disable()
//    tutorialDropdown.classList.add("disabledElement")
  }

  override def enable() {
    controlsUI.enable()
//    tutorialDropdown.classList.remove("disabledElement")
  }

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
