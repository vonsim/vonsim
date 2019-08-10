package vonsim.webapp

// tutorial https://www.scala-js.org/tutorial/basic/
// canvas https://github.com/vmunier/scalajs-simple-canvas-game/blob/master/src/main/scala/simplegame/SimpleCanvasGame.scala

import scala.scalajs.js.JSApp
import scala.scalajs.js
import org.scalajs.dom
import org.scalajs.dom.Element

import dom.document
import scala.scalajs.js.annotation.JSExport
import scalatags.JsDom.all._
import org.scalajs.dom.raw.HTMLElement
import js.JSConverters._

import java.awt.Event
import scala.util.parsing.input.Position
import scala.scalajs.js.timers._

import dom.ext._
import scala.scalajs.concurrent
            .JSExecutionContext
            .Implicits
            .queue
import vonsim.simulator.Simulator
import vonsim.assembly.Compiler
import java.awt.Window

import vonsim.assembly
import vonsim.webapp.i18n.Spanish
import vonsim.webapp.i18n.UILanguage
import vonsim.assembly.i18n.CompilerLanguage
import vonsim.simulator.i18n.SimulatorLanguage
import vonsim.webapp.tutorials.BasicTutorial
import vonsim.webapp.tutorials.Tutorial


class Languages(val uiLanguage:UILanguage,val compilerLanguage:CompilerLanguage,val simulatorLanguage:SimulatorLanguage){
  
}

object URLParametersParser{
  def apply(url:String)={
     

    val parameters=url
                   .substring(1).trim()
                   .split("&")
                   .map(_.trim())
                   .filter(_.length()>0)
                   .filter(_.contains("="))  
            
    val parametersTuple=parameters.map(js.URIUtils.decodeURIComponent)
                   .map(q => q.split("="))
                   .map { q => (q(0),q(1)) }
    parametersTuple.toMap
  }
}
object Main extends JSApp {

  def getParameters()=URLParametersParser(dom.window.location.search)
  
  val codeURLKey="url"
  val cookieLanguageKey="lang"
  val tutorialKey="tutorial"
  val stepKey="step"
  def saveCodeKey="code"
  var fallbackLanguage=Spanish.code

  def getInitialCode(languages:Languages,parameters:Map[String,String],initializationFunction:Function1[String,Unit]){
      
    if (parameters.keySet.contains(codeURLKey)){
      val url=parameters(codeURLKey)
      val headers=Map("crossDomain" -> "true"
      ,"Access-Control-Allow-Origin" -> "*"
      , "dataType"-> "text")
      
      val promise=Ajax.get(url,timeout=5000,headers=headers,responseType="text")
      promise.onSuccess{ 
        case xhr =>
          initializationFunction.apply(xhr.responseText)
      }
      promise.onFailure{
        case xhr =>
          initializationFunction.apply(defaultCode)
          dom.window.alert(languages.uiLanguage.alertURLNotFound(url))
      }
      
    }else{
      val lastCode=dom.window.localStorage.getItem(saveCodeKey)
      if (lastCode!=null){
        initializationFunction.apply(lastCode)
      }else{
        initializationFunction.apply(defaultCode)
      }
    }
  }
  def main(): Unit = {
    println("Getting language code")
    val languageCode=getLanguageCode()
    println("Getting language")
    val languages=getLanguages(languageCode)
    println("Getting parameters")
    val parameters = getParameters()
    println("Getting tutorial")
    val tutorial = getTutorial(parameters)
    getInitialCode(languages,parameters, code => {
      initializeUI(code,languages,tutorial) 
    })

    
  }
  
  var ui:MainUI=null
  var s:VonSimState=null
  
  def getTutorial(parameters:Map[String,String])={
    if (parameters.keySet.contains(tutorialKey)){
      val tutorialId=parameters(tutorialKey)
      if (Tutorial.tutorials.keySet.contains(tutorialId)){
        val tutorial=Tutorial.tutorials(tutorialId)
        val stepString=dom.window.location.hash.substring(1)
        try{
          val step=Integer.parseUnsignedInt(stepString)-1
          if ( step >=0 && step<tutorial.steps.length){
            tutorial.goto(step)
          }
        }catch {
          case e:NumberFormatException => 
        }
        Option(tutorial)  
      }else{
        None
      }
    }else{
      None
    }
  }
  
  def initializeUI(initialCode:String,l:Languages,tutorial:Option[Tutorial]){
    
    val compilationResult=Compiler(initialCode)

    Compiler.language=l.compilerLanguage
    val simulator=Simulator.Empty()
    simulator.language=l.simulatorLanguage
    
    var s=new VonSimState(simulator,compilationResult,l.uiLanguage)
    
    ui = new MainUI(s,initialCode,saveCodeKey,tutorial)
    document.body.appendChild(ui.root)
    ui.editorUI.editor.resize(true)
    setTimeout(2000)({ui.editorUI.editor.resize(true)})
  }
  def getLanguageCode():String={
      println("Detected language: "+dom.window.navigator.language)
      var language=dom.window.localStorage.getItem(cookieLanguageKey)
      if (language==null){
         if (dom.window.navigator.language != null && dom.window.navigator.language.trim() != ""){
             language=dom.window.navigator.language.split("-")(0)
             language=language.toLowerCase
          }else{
            language=fallbackLanguage
          }
      }
      dom.window.localStorage.setItem(cookieLanguageKey,language)
      language
  }
  def languageCodeToObject[T](languageToObject:Map[String,T],language:String)={
    if (languageToObject.keySet.contains(language)){
      languageToObject(language)
    }else{
      languageToObject(fallbackLanguage)
    }
   
  }
  def getLanguages(language:String)={
    val uiLanguage=languageCodeToObject(UILanguage.codes, language)
    val compilerLanguage=languageCodeToObject(CompilerLanguage.codes, language)
    val simulatorLanguage=languageCodeToObject(SimulatorLanguage.codes, language)
    new Languages(uiLanguage,compilerLanguage,simulatorLanguage)
  }
  

  def defaultCode = """org 1000h
; variables here


org 2000h
; your code here
hlt
end
"""

}





  