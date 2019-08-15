package vonsim.webapp.tutorials

import vonsim.webapp.UIConfig

class VonSimTutorial extends Tutorial {
  val title = "Uso del simulador VonSim"

  val initialCode = """

    """

  val id = "vonsim"

  val steps = List(
    TutorialStep(
      "Uso del simulador VonSim",
      """<p><strong>Objetivo:</strong> Aprender a ejecutar y visualizar programas con el simulador
  VonSim.</p> 

<p><strong>Conocimientos previos:</strong> Concepto del lenguaje Assembly.
Conocimientos elementales de organización y arquitectura de computadoras y programación.</p>
  
""",
      UIConfig.disableAll,
      None
    ),
    TutorialStep(
      "Introducción",
      """<p>VonSim es una herramienta para aprender a programar en el lenguaje assembly.</p>
  <p>VonSim nos permite ejecutar código assembly y visualizar los efectos de las instrucciones
  en una simulación de una computadora simple, con una CPU y memoria principal. </p>
""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "¿Cómo usar el simulador?",
      """<p> El simulador VonSim tiene tres partes principales: el editor de código, el panel de control de la
  ejecución, y la visualización de la computadora.</p>
  <p>Al trabajar con VonSim generalmente escribirás un poco de código en el editor, luego lo ejecutarás
  con los controles del panel, y verás el resultado de la ejecución mediante la visualización de la computadora.
  </p>

""",
      UIConfig.disableAll
    ),
    TutorialStep(
      "Editor de código",
      """<p>Abajo a la izquierda encontrarás el editor de código assembly.</p>
<p>Este editor tiene una verificación automática de sintáxis y semántica del lenguaje, por lo que
si bien no puede detectar todos los errores posibles de programación, te indicará con una cruz roja
cuando una instrucción es incorrecta o falta algo en el programa.</p>
""",
      UIConfig.disableAllButEditor
    ),
    TutorialStep(
      "Controles de ejecución",
      """<p>Arriba se encuentra el panel de control de la ejecución. </p>
<p> El botón "Ejecución Rápida" permite cargar el código assembly de un programa y ejecutar todo 
el programa hasta su finalización. </p>
<p> El botón "Depurar" permite ejecutar el programa paso a paso, es decir, una instrucción a la vez.
De esta forma forma se puede analizar qué hace cada instrucción del programa.</p>
""",
      UIConfig.disableAllButControls
    ),
    TutorialStep(
      "Visualización de la computadora",
      """
<p>A la derecha encontrarás la visualización de la computadora simulada, donde se muestran la CPU y la memoria.</p> 
<p>La CPU tiene varios registros, algunos de propósito general y otros especiales, donde se 
almacena información. </p>
<p> Además, la CPU contiene la ALU, donde se realizan los cálculos aritméticos y lógicos</p>
<p> La memoria muestra la dirección (izquierda) y el valor (derecha) de cada una de las celdas de memoria. Los números
están códificados en hexadecimal.</p>
</p>Tanto la memoria como los registros sirven para guardar información. 
La diferencia que tienen es que si bien la primera tiene mucho más espacio, es más lenta para leer o escribir que los registros.</p>
""",
      UIConfig.disableAllButMainboard
    ),
    TutorialStep(
      "¿Cómo ejecutar programas?",
      """<p class="exercise">La forma más simple de ejecutar un programa es simplemente presionar el botón "Ejecución Rápida". Prueba hacerlo.</p>
  
<p>Se ejecutará el programa de ejemplo que está en el editor, y la dirección de memoria 0002 tomará el valor 1A.</p>

<p>Si todo sale bien, en el panel de ejecución aparecerá el mensaje "Ejecución Finalizada" en verde.</p>

<p>Por ahora, no utilizaremos los botones "Depurar", "Finalizar" o "Paso".</p>

<p class="exercise">Verifica que el registro AX tenga el valor hexadecimal 3AF2. Dicho registro 
se encuentra en "Registros de propósito general", dentro de "CPU".</p>

""",
      UIConfig.enableAll,
      Some("""org 2000h
mov ax, 3AF2h
hlt
end
""")
    ),
    TutorialStep(
      "Errores de compilación",
      """
  
<p>Cuando un programa tiene errores, el editor de texto mostrará una <strong>x</strong> roja a la izquierda
de la instrucción que está generando el error.</p>  
<p> Ten en cuenta que si el programa contiene errores, no podrás cargarlo y ejecutarlo.
En ese caso deberás corregirlo para que pueda ejecutarse.</p>

<div class="exercise">
<p>
Corrige el programa que está en el editor.
</p> 

<p>En la línea que dice:  <code>mov ap, 8</code>, hubo una confusión, se debe
 escribir ax en lugar de <code>ap</code>
</p>
<p>Luego, ejecuta el programa.
</p>

</div>
  


""",
      UIConfig.enableAll,
      Some("""org 2000h
mov ap, 8
hlt
end
""")
    ),
    TutorialStep(
      "Resumen",
      """
  <p>VonSim es un simulador para la ejecución del lenguaje Assembly en una computadora.</p>
 <p>Los controles permiten ejecutar un programa.</p>
 <p>El editor permite escribir un programa y nos indica si este tiene errores de compilación.</p>
 <p>La visualización nos permite observar el resultado de la ejecución de un programa.</p>

""",
      UIConfig.disableAll,
      Some("")
    ),
    TutorialStep(
      "A continuación",
      """
 <p>Ahora que sabes utilizar la interfaz de VonSim, puedes aprender sobre
 <a href="?tutorial=basic">la estructura de los programas en assembly</a>.</p>
 
""",
      UIConfig.disableAll,
      Some("")
    )
  )
}
