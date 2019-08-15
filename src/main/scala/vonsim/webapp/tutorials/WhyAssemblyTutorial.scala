package vonsim.webapp.tutorials

import vonsim.webapp.UIConfig

class WhyAssemblyTutorial extends Tutorial {
  val title = "Assembly"

  override def fullscreen = true

  val initialCode = """
org 2000h
; código aquí
hlt
end
    """

  val id = "whyassembly"

  val steps = List(
    TutorialStep(
      "Assembly",
      """<p><strong>Objetivo:</strong> Conocer el lenguaje Assembly y su importancia especial dentro de los lenguajes de programación.</p> 

<p><strong>Conocimientos previos:</strong> 
Conocimientos elementales de organización y arquitectura de computadoras y programación.</p>
  
""",
      UIConfig.disableAll,
      None
    ),
    TutorialStep(
      "Introducción",
      """
<p>Si quisieramos programar un procesador sin un lenguaje de programación, 
deberíamos conocer exactamente el código binario de cada 
instrucción del procesador, lo cual resultaría engorroso y propenso a errores.</p>
 
<p>El lenguaje assembly le da nombres a estos códigos, de manera que para sumar 
podamos escribir <code>add</code> (<em>add</em> significa <em>sumar</em> en inglés) en lugar de <code>00000101</code>, por ejemplo.
Por ende, assembly es el lenguaje de programación de más bajo nivel de abstracción que existe, 
ya que es solo una pequeña capa de abstracción sobre los códigos de instrucción del procesador.</p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "¿Por qué aprender assembly?",
      """<p>El lenguaje assembly es una de las herramientas más antiguas de los programadores.
No obstante, hoy en día casi cualquier tipo de software puede desarrollarse sin siquiera tener 
que mirar una sola línea de código assembly.</p>
<p>¿Por qué aprenderlo, entonces?</p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "La importancia del assembly",
      """
<p>La mejor respuesta es que todo el código que un programador escribe, sea en el lenguaje que sea, en
algún momento se traducirá a código de máquina para ser ejecutado por el procesador, y el lenguaje assembly
es lo más parecido al código de máquina que existe. Por ende, si queremos entender realmente qué hace
un lenguaje de programación, y qué hace un procesador, necesitamos conocer el lenguaje assembly.</p> 

<p> En ese sentido, el lenguaje assembly es la forma más directa de comunicación que podemos 
tener con una computadora. Con assembly, un programador puede controlar detalladamente el flujo 
de ejecución y de datos en un programa.</p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Niveles de los lenguajes",
      """<p>Los lenguajes de programación se suelen clasificar en niveles según su abstracción.
          En el nivel más bajo está el código de máquina, en binario. Un poco más arriba está
          el Assembly, pero también se considera de bajo nivel. Luego tenemos los lenguajes
          compilados cl_ásicos como Pascal o C, ya considerados como de alto nivel. 
          Después tenemos lenguajes interpretados o con máquina virtual, como Python, 
          Perl o Java.</p>
          
          <p> A medida que subimos de nivel de abstracción, generalmente perdemos control fino
          sobre la ejecución del programa pero el lenguaje es más fácil de programar.
          </p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Aplicaciones del assembly",
      """
<p> Desarrollar programas en assembly en general lleva más tiempo que en lenguajes de 
alto nivel. Por ende, generalmente no es nuestra primera opción al comenzar un 
proyecto de software. No obstante, resulta de gran utilidad saber un poco acerca 
del mismo, ya que para algunas aplicaciones es necesario utilizarlo.</p>

          <p>Para algunas tareas de programación como desarrollar módulos del sistema operativo,
controladores o el software de arranque de una computadora, el lenguaje assembly muchas veces es nuestra
única opción debido a que necesitamos acceder a funcionalidades de bajo nivel o de hardware.</p> 

<p> Para algunas aplicaciones particulares, un algoritmo implementado en assembly puede ser más
eficiente y utilizar menos recursos que el mismo algoritmo implementado en un lenguaje de alto nivel.
Esto es especialmente cierto cuando los fabricantes de los procesadores agregar capacidades nuevas
a la CPU que los compiladores de los lenguajes de alto nivel todavía no soportan. </p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Aplicaciones: Programación del sistema operativo",
      """
          <p>Para algunas tareas de programación como desarrollar módulos del sistema operativo,
controladores o el software de arranque de una computadora, el lenguaje assembly muchas veces es nuestra
única opción debido a que necesitamos acceder a funcionalidades de bajo nivel o de hardware.</p> 

""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Aplicaciones: Instrucciones nuevas o particulares de un procesador",
      """
<p> Para algunas aplicaciones particulares, un algoritmo implementado en assembly puede ser más
eficiente y utilizar menos recursos que el mismo algoritmo implementado en un lenguaje de alto nivel.
Esto es especialmente cierto cuando los fabricantes de los procesadores agregar capacidades nuevas
a la CPU que los compiladores de los lenguajes de alto nivel todavía no soportan. </p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Aplicaciones: Analizar código existente",
      """

<p> Si tenemos un programa compilado en un lenguaje de alto nivel pero no podemos acceder 
al código fuente, la única manera de ver que hace el programa es examinando el archivo 
binario ejecutable. En general es muy difícil o casi imposible volver a traducir el 
código binario al lenguaje original de alto nivel. Entonces sólo podremos traducirlo 
a assembly y verlo en este lenguaje de bajo nivel.</p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Evaluación",
      """

<div class="exercise">
<p>Decida si las siguientes afirmaciones son verdaderas o falsas. Luego verifique las respuestas:</p>

<ol>
  <li>Assembly es un lenguaje de alto nivel.</li>
  <li>La programación en assembly suele usarse para desarrollar algunas funciones de los
  sistemas operativos.</li>
  <li>Las aplicaciones modernas suelen desarrollarse en Assembly</li>
  <li>La programación en Assembly suele ser más lenta que en otros lenguajes.</li>
  <li>Es necesario saber Assembly para comprender cómo se ejecutan 
  realmente las sentencias de un lenguaje de programación en el procesador. </li>
</ol>

</div>

<div class="answer">
<ol> 
<li>Falso, es un lenguaje de <strong>bajo</strong> nivel, de hecho, el más bajo.</li>
<li>Verdadero, para acceder a algunas funciones del hardware específicas.</li>
<li>Falso, programar en Assembly suele ser más difícil que en otros lenguajes, ya que
lleva más tiempo y es más fácil cometer errores.</li>
<li>Verdadero, generalmente por cada línea de un lenguaje de código de alto nivel 
como Python o Java, tenemos que escribir varias instruccciones en Assembly.</li>
<li> Verdadero. En última instancia, cualquier programa, de cualquier otro lenguaje,
se termina traduciendo a Assembly (o a código de máquina).</li>
</ol>
</div>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Resumen",
      """
  <p>Assembly es un lenguaje de programación que le pone nombres 
  a los códigos binarios de la máquina.</p>
 <p>Es un lenguaje de programación de bajo nivel.</p>
 <p>Las instrucciones en assembly se asemejan a las de código de máquina pero son 
 más fáciles de leer y escribir.</p>
<p>Si bien no suele usarse actualmente para desarrollar programas típicos, si sirve
 para algunas aplicaciones particulares como el desarrollo de sistemas operativos.</p>
""",
      UIConfig.disableAll,
      Some("")
    ),
    TutorialStep(
      "A continuación",
      """
 <p>Ahora que sabes por qué es interesante conocer más sobre Assembly, 
 puedes <a href="?tutorial=vonsim"> aprender a utilizar el simulador VonSim</a>.</p>
 
""",
      UIConfig.disableAll,
      Some("")
    )
  )
}
