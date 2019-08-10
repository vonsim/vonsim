package vonsim.webapp.tutorials

import vonsim.webapp.VonSimState
import vonsim.webapp.UIConfig




object TutorialStep{
  def apply(title:String,content:String,config:UIConfig=UIConfig(),code:Option[String]=None)={
    new TutorialStep(title,content,config,code)
  }
}
class TutorialStep(val title:String,val content:String,val config:UIConfig,val code:Option[String]=None){
  def canForward(s:VonSimState)=true
  def canBackward(s:VonSimState)=true
}

object Tutorial{
  val bt=new BasicTutorial()
  val st=new CodeTutorial()
  val vt=new VariablesTutorial()
  val vst=new VonSimTutorial()
  val wat=new WhyAssemblyTutorial()
  val tutorials=Map(bt.id -> bt,st.id -> st,vt.id -> vt,vst.id -> vst, wat.id ->wat)
}

abstract class Tutorial{
  def steps:List[TutorialStep]
  def initialCode:String
  def title:String
  def id:String
  var step=0
  def hasNext=step<steps.length-1
  def fullscreen=false

  def canForward(s:VonSimState)={
    steps(step).canForward(s) && hasNext
  }
  def canBackward(s:VonSimState)={
    steps(step).canBackward(s) && hasPrevious
  }
  def hasPrevious=step>0
  def next{step+=1}
  def previous{step-=1}
  def current=steps(step)
  def goto(step:Int){this.step=step}
  
  
}