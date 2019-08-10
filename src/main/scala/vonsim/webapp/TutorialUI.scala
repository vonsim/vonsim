package vonsim.webapp
import vonsim.utils.CollectionUtils._
import vonsim.simulator.InstructionInfo
import scala.scalajs.js.annotation.ScalaJSDefined
import scala.scalajs.js.annotation.JSName
import org.scalajs.dom.html._
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom
import scala.scalajs.js
import js.JSConverters._
import vonsim.simulator.Simulator
import scalatags.JsDom.all._



import vonsim.simulator.SimulatorProgramExecuting
import vonsim.assembly.Compiler.CompilationResult

import vonsim.assembly.Location
import vonsim.assembly.LexerError
import vonsim.assembly.ParserError
import vonsim.assembly.SemanticError
import vonsim.assembly.CompilationError
import scala.collection.mutable.ListBuffer
import vonsim.webapp.tutorials.Tutorial
import vonsim.assembly.lexer.Token
import vonsim.assembly.lexer.AL
import vonsim.assembly.lexer.RegisterToken
import vonsim.assembly.lexer.DW
import vonsim.assembly.lexer.DB





class TutorialUIControl(s: VonSimState,val tutorial:Tutorial,tutorialUpdated:Function0[Unit]) extends VonSimUI(s) {
  
  def buttonFactory(text:String,iconClass:String)=a(cls:="tutorialButton btn btn-primary"
//        ,img(cls:="",src := imageUrl, alt := s)
        ,i(cls:=s"fa $iconClass")     
        ,text
        ,title := text
        ).render
  val nextButton=buttonFactory("Siguiente","fa-next")
  val previousButton=buttonFactory("Anterior","fa-previous")
  val current=span().render
  val total=span().render
  
  val tutorialIndexUI=new TutorialIndexUI(s,tutorial,(stepSelected:Int)=>{
    tutorial.goto(stepSelected)
    update()
    tutorialUpdated.apply()
  })
  
  val tutorialTitle=span(id := "tutorialTitle"
      ,a(cls:="helpButton"
      ,data("toggle"):="modal"
      ,data("target"):="#tutorialIndexModal"
      ,tutorial.title
      )
      ,tutorialIndexUI.root
      ).render
  
  
   
  val root=div(id:="tutorialControls"
      ,tutorialTitle
      ,div(id:="tutorialControlsInner"
      ,previousButton
      ,span(id:="tutorialCount",current,"/",total)
      ,nextButton
      )).render
  update() 
  def setDisabled(button:Anchor,disabled:Boolean){
    disabled match{
      case true => button.classList.add("disabled")
      case false => button.classList.remove("disabled")
    }
  }
  
  def update(){
    setDisabled(nextButton, !tutorial.canForward(s))
    setDisabled(previousButton, !tutorial.canBackward(s))
    current.textContent=(tutorial.step+1).toString()
    total.textContent=tutorial.steps.length.toString()
    
  }
  previousButton.onclick=(e:Any) =>{
    tutorial.previous
    update()
    tutorialUpdated.apply()
  }
  nextButton.onclick=(e:Any) =>{
    tutorial.next
    update()
    tutorialUpdated.apply()
  }
  
  def simulatorEvent() {
  }
  
  def simulatorEvent(i:InstructionInfo) {
    simulatorEvent()
  }
  
  def compilationEvent(){
    
  }
  
}

class TutorialIndexUI(s:VonSimState,tutorial:Tutorial,selectStep:Function1[Int,Unit]) extends ModalUI(s,"tutorialIndexModal"){
  
  def getHeader()={
    div(cls:="modal-header-help",img(cls:= "modal-icon", alt := "Von Sim Icon", title := s.uil.iconTitle, src := "img/icon.png")
              ,h4(cls:="modal-title",tutorial.title)
              ,button(`type`:="button",cls:="close", data("dismiss"):="modal",i(cls:="fa fa-close"))
    ).render
  }
  def getBody()={
 
    val stepList=ol(cls:="list-group").render
    
    for ((step,i) <- tutorial.steps.zipWithIndex){
      val indexItem=a().render
      indexItem.innerHTML=step.title
      
      indexItem.onclick = (e:Any)=>{
        selectStep(i)
        close()
        
      }
      stepList.appendChild(li(cls:="list-group-item",indexItem).render)
    }
    val body=div(cls:=""
      ,h3("Índice")
      ,stepList
    ).render
    body
  }
  
  def getFooter()={
    div(cls:=""
    
    ).render
  }
  
  def simulatorEvent() {
  }
  
  def simulatorEvent(i:InstructionInfo) {
  }
  def compilationEvent(){
  }
  
}
class TutorialUI(s: VonSimState,val tutorial:Tutorial,val mainUI:MainUI) extends VonSimUI(s) {

  
  val controls=new TutorialUIControl(s,tutorial,() => {
    displayTutorialStep()
  })
  val content=div().render
  val subtitle=span(id:="tutorialStepTitle").render
  
  val header=h3(subtitle)
  
  val root = div(id := "tutorial"
     ,div(id:="tutorialHeader"
       ,controls.root
       ,header)
     ,div(id:="tutorialContent",content)
     
     ).render
  
  
  def startTutorial(){
    mainUI.editorUI.setCode(tutorial.initialCode)
//    title.textContent=tutorial.title
    displayTutorialStep()  
  }
  
  def preprocessContent(content:String)={
      var result=content
      val exceptedRegisters=List(AL())
      val registers=Token.registers.filter(r => !exceptedRegisters.contains(r))
      result=preprocessContentForTokens(result,registers,"register","")
      result=preprocessContentForTokens(result,exceptedRegisters,"register","_")
      result=preprocessValues(result)
      result=preprocessContentForTokens(result,Token.ops,"instruction","")
      result=preprocessContentForTokens(result,List(DB(),DW()),"type","")
      result
  }
  
  def preprocessValues(content:String)={
    val valueClass="value"
    var result=content

    result=result.replaceAll(boundary+"([0-9][0-9A-Faf]*h)(?!_)","""$1<span class="value">$2</span>""")
    result=result.replaceAll(boundary+"([0-1]+b)(?!_)","""$1<span class="value">$2</span>""")
    result=result.replaceAll(boundary+"""(-?[0-9]+)([\b\s.,<])(?!_)""","""$1<span class="value">$2</span>$3""")
    result=result.replaceAll("""(-?[0-9]+)(_)""","""$1""")
    result
  }
  
  def tokenToKeyword(l:List[Token])=l.map(r => {
      val s=r.toString().toLowerCase()
      val l=s.length()
      s.subSequence(0, l-2)
  })
      
  def boundary= """([,.=+?¿()]|\b)"""
  def preprocessContentForTokens(content:String,tokens:List[Token],cls:String,prefix:String)={
    var result=content
    
    val registers=tokens
    val keywords = tokenToKeyword(registers)
    
    for (keyword <- keywords){
      val replacement="<span class=\""+cls+"\">$2</span>"
      val pattern =boundary+prefix+"("+keyword.toString()+")"+boundary
      result=result.replaceAll(pattern, "$1"+replacement+"$3")
      val patternNeg=boundary+prefix+"("+keyword.toString()+")(_)"+boundary
      result=result.replaceAll(patternNeg, "$1$2$4")
    }
    
    result
  }
  
  def displayTutorialStep(){
    
    subtitle.innerHTML=preprocessContent(tutorial.current.title)
    content.innerHTML=preprocessContent(tutorial.current.content)
    mainUI.applyUIConfig(tutorial.current.config)
    dom.window.location.hash=(tutorial.step+1).toString()
    tutorial.current.code match {  
      case Some(s)=> mainUI.editorUI.setCode(s)
      case None => 
    }
    val elements=content.getElementsByClassName("answer")
    for (i <- 0 until elements.length){
      
      val element=elements.item(i)
//      println(element)
      val answerId="answer"+i
      val link = button(cls:="btn btn-info","Respuesta",data("toggle"):="collapse",data("target"):="#"+answerId).render
      val answerContainer=div(cls:="answerContainer",link).render
      link.onclick=(e:Any) =>{
        
      } 
      element.parentNode.replaceChild(answerContainer, element)
      val answerContent=div(id:=answerId,cls:="answerContent collapse",element).render
      //container.appendChild(answerContainer)
      answerContainer.appendChild(answerContent)
//      element.insertBefore(link, element.firstChild)
//      element.attributes.setNamedItem(arg)
    }
  }
  def simulatorEvent() {
    // TODO check if code can be run and if the cpu is halted to allow enable buttons    
    if (s.isSimulatorExecuting()){
      disable()
    }else{
      enable()
    }
  }
  
//  def disable(){root.disabled=true}
//  def enable() {root.disabled=false}
  
  def simulatorEvent(i:InstructionInfo) {
    simulatorEvent()
  }
  
  
  def compilationEvent(){
    s.c match {
      case Left(f) => {
        
      }
      case Right(f) => {
      }
    }
  }
}



