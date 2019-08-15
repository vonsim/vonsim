package vonsim.webapp.tutorials

import vonsim.webapp.UIConfig

class BasicTutorial extends Tutorial {
  val title = "Estructura de un programa en Assembler con VonSim"

  val initialCode = """
org 2000h
; código aquí
hlt
end
    """

  val id = "basic"

  val steps = List(
    TutorialStep(
      "Estructura de un programa en Assembly con VonSim",
      """<p><strong>Objetivo:</strong> Comprender la estructura
   básica de un programa en Assembly.</p> 

<p><strong>Conocimientos previos:</strong> Uso del simulador VonSim.
Conocimientos elementales de organización y arquitectura de computadoras y programación.</p>
  
""",
      UIConfig.disableAll,
      None
    ),
    TutorialStep(
      "El programa más simple",
      """<p>En assembly todos los programas deben terminar con la sentencia <code>end</code>. Por ende, el programa 
  más simple que compila correctamente solo tiene esta sentencia.</p>
<p class="exercise">Escribe en el editor la sentencia <code>end</code>y luego ejecuta el programa.</p>
<p> Si bien este programa compila, genera un error en su ejecución. </p>
<p> El error radica en que cuando un programa en assembly comienza a ejecutarse, sólo termina cuando
se encuentra la instrucción <code>hlt</code>, que detiene al procesador.</p>
""",
      UIConfig.enableAll,
      Some("")
    ),
    TutorialStep(
      "Deteniendo al procesador con <code>hlt</code>",
      """<p class="exercise">Para detener al procesador entonces, debemos agregar una instrucción <code>hlt</code>. Agrega la misma antes de
  la sentencia <code>end</code>.</p>
  
<p> Observa que el compilador marca un error. Lleva el puntero hacia la <strong>x</strong> que indica
el error a la izquierda de la instrucción <code>hlt</code>.</p> 
<p>Cómo dice el mensaje, el error se genera debido a que no le hemos dicho al compilador dónde 
se ubicará en memoria el código binario de la instrucción <code>hlt</code>.<p>
""",
      UIConfig.enableAll,
      Some("end")
    ),
    TutorialStep(
      "Ubicando las instrucciones con <code>org</code>",
      """<p>La sentencia <code>org</code> nos permite indicar donde se van 
  a cargar las instrucciones en la memoria.</p>
  <p>Su sintaxis es <code>org <strong>dirección</strong></code></p>
  <p>Al código generalmente lo ubicamos en la dirección 2000h, entonces en ese caso
  pondríamos <code>org 2000h</code>.</p>
  <p> En VonSim el h al final de un número se utiliza para que 
se interprete como hexadecimal. En general, las direcciones de memoria las escribiremos en hexadecimal.</p>
""",
      UIConfig.enableAll,
      Some("hlt\nend")
    ),
    TutorialStep(
      "Ubicando la instrucción <code>hlt</code>",
      """<p>Para ubicar la instrucción <code>hlt</code> en la memoria, debemos agregar un <code>org</code>
  en la línea anterior a la del <code>hlt</code>.</p>

<p class="exercise"> Agrega la sentencia <code>org 2000h</code> antes de <code>hlt</code> y corre el programa. </p>
""",
      UIConfig.enableAll,
      Some("hlt\nend")
    ),
    TutorialStep(
      "La ubicación de las instrucciones en la memoria",
      """<p>Ahora podemos ver que el programa se ejecuta correctamente (aunque todavía no hace nada útil).</p>
  
 <p> Verifiquemos que el <code>hlt</code> se cargó en la dirección 2000h efectivamente
<p class="exercise"> Ejecuta el programa y busca en la memoria la celda con dirección 2000h (la dirección es la primer columna de la memoria).
Puedes escribir esta dirección en el buscador de la memoria para encontrarla más rápidamente.</p>
<p> En esa dirección está el valor 45h (el valor es la columna de la derecha de la memoria), que es el código binario que representa la instrucción <code>hlt</code>.<p>
<p> Esto es porque el compilador generó el código binario de la instrucción <code>hlt</code> y lo puso en esa dirección.
""",
      UIConfig.enableAll,
      Some("org 2000h\nhlt\nend")
    ),
    TutorialStep(
      "La dirección de comienzo",
      """<p>La dirección 2000h es especial ya que es allí donde el procesador comienza a buscar instrucciones
  para ejecutar por defecto. Si en la dirección inicial (2000h) no hay instrucciones el programa 
  generará un mensaje de error. </p>
  
<p class="exercise">Cambia el 2000h por otra dirección (por ejemplo 20h). Ejecuta el programa.<p> 

<p> Ocurrirá un error nuevamente, ya que el simulador quiere comenzar a ejecutar las instrucciones que 
están en la dirección 2000h, pero allí no hay realmente nada ya que las mismas están en la 20h. Por ende 
es muy importante que las instrucciones de un programa se ubiquen después de la 2000h</p>

<p> No obstante, la instrucción <code>hlt</code> se sigue codificando y copiando a la memoria, sólo que no en la 
dirección 2000h, sino en la 20h.<p>
<p class="exercise"> Verifica que en la dirección 20h de la memoria se encuentre guardado 
el valor 45h, el código binario del <code>hlt</code> </p>
""",
      UIConfig.enableAll,
      Some("org 2000h\nhlt\nend")
    ),
    TutorialStep(
      "Sentencias e instrucciones",
      """<p>Habrás notado que hablamos de <strong>sentencias</strong> y de <strong>instrucciones</strong>. 
  ¿Cuál es la diferencia?</p> 

<p> Llamamos sentencias a <code>org 2000h</code> y <code>end</code> porque no son realmente instrucciones
que el procesador ejecuta.</p> 
<p> En verdad, son directivas del compilador que lo ayudan a generar el código binario del programa, 
por eso no se guardan en la memoria ni tienen forma de ser codificadas en binario.</p>
""",
      UIConfig.enableAll,
      Some("org 2000h\nhlt\nend")
    ),
    TutorialStep(
      "Mayúsculas y minúsculas",
      """<p>Assembly es generalmente insensible a mayúsculas y minúsculas.</p>
  
<p> Por ende es lo mismo escribir <code>HLT</code> que <code>hlt</code> o <code>HlT</code>. Lo mismo sucede con la sentencia <code>END</code> y otras.<p> 

<p class="exercise"> Prueba el siguiente programa y verifica que es igual al anterior. Modifica alguna letra para pasarla
de minúscula a mayúscula o viceversa y vuelve a ejecutar el programa. En todos los casos el programa compila igual. </p>

""",
      UIConfig.enableAll,
      Some("oRg 2000h\nHLt\nEnD")
    ),
    TutorialStep(
      "Autoevaluación",
      """
<ol>
  
<li><p class="exercise">¿Es hlt una instrucción? ¿o una sentencia?</p>
<p class="answer">Es una instrucción. </p></li>  

<li><p class="exercise">¿Cuál es la función de hlt ?</p>
<p class="answer">La instrucción hlt detiene al procesador, 
y por ende sirve para finalizar la ejecución de un programa. </p></li>

<li><p class="exercise">¿Es org una instrucción? ¿o una sentencia?</p>
<p class="answer">Es una sentencia, que le indica al compilador de assembly donde ubicar
las instrucciones del programa en la memoria, pero no es ejecutada por el procesador. </p></li>

<li><p class="exercise">¿Cual es la función de end ?</p>
<p class="answer">Su función es indicarle al compilador de assembly donde ubicar
las instrucciones del programa en la memoria, pero no es ejecutada por el procesador. </p></li>

<li><p class="exercise">¿Es end una instrucción? ¿O una sentencia?</p>
<p class="answer">Dado que no se ejecuta por el procesador, 
y que le indica al compilador donde termina el programa,
es una sentencia.</p></li>

<li><p class="exercise">En assembly ¿Es válido escribir end? ¿y END? ¿y EnD?</p>
<p class="answer">Las tres son sentencias válidas y significan lo mismo,
 ya que assembly no distingue entre mayúsculas y minúsculas.</p></li>

<li><p class="exercise">¿Por qué la dirección 2000h es especial en el simulador VonSim?</p>
<p class="answer">Porque en esa dirección el simulador busca la primer instrucción del programa
para ejecutar.</p></li>
</ol>

""",
      UIConfig.enableAll,
      None
    ),
    TutorialStep(
      "Resumen",
      """
  <p>Repasemos lo que hemos visto hasta ahora:</p>
 <p> Un programa en assembly contiene varias sentencias e instrucciones, una por línea.</p>
  <p>El programa debe finalizar con la sentencia <code>end</code> para indicarle al compilador donde termina el programa. <p>
  
  <p> Para que la CPU se detenga al finalizar el programa, el mismo debe contener una instrucción <code>hlt</code>.<p>
 
 <p> A las instrucciones, como <code>hlt</code> se les debe indicar dónde ubicarse en la memoria.
 Para ello, se utilizan sentencias <code>org</code>, con sintaxis <code> org direccion</code>. Las direcciones generalmente 
se escriben en hexadecimal, de modo que siempre terminan con h.<p>
  
 <p> Las sentencias e instrucciones en assembly son insensibles a mayúsculas y minúsculas, 
 por lo que es lo mismo escribir <code>HLT</code> que <code>hlt</code> o <code>HlT</code>.<p> 

""",
      UIConfig.disableAll,
      Some("")
    ),
    TutorialStep(
      "A continuación",
      """
 <p>Ahora que has dado los primeros pasos en Assembly con VonSim, podés avanzar
 más con el <a href="?tutorial=variables">tutorial sobre variables en assembly</a>.</p>
 
""",
      UIConfig.disableAll,
      Some("")
    )
  )
}
