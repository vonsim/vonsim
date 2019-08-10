package vonsim.webapp.tutorials

import vonsim.webapp.UIConfig

class CodeTutorial extends Tutorial {
  val title="Instrucciones y registros de VonSim"
  
  val initialCode="""
org 2000h
; código aquí
hlt
end
    """
  
  
  val id="code"
  
  val steps=List(

       TutorialStep("Instrucciones y registros de VonSim"
,"""<p><strong>Objetivos:</strong> Comprender el concepto de registro 
  y las operaciones para manipularlo. </p> 

<p><strong>Conocimientos previos:</strong> Uso del simulador VonSim. Estructura básica de un programa
en assembly. Conocimientos básicos de organización y arquitectura de computadoras.</p>
  
""",UIConfig.disableAll,None
)

,TutorialStep("Introducción"
,"""<p>Sabiendo ya como escribir y ejecutar programas con VonSim, y la estructura básica de un 
  programa en assembly, vamos a comenzar a ver las instrucciones más usuales de assembly y las 
  formas de guardar información.</p> 

<p>Comenzaremos viendo y probando los registros de la CPU donde se puede guardar información
  y las instrucciones para manipularlos.</p>
   
</p>A medida que tengamos más conocimiento, vamos a poder hacer programas que sean de utilidad.<p> 

""",UIConfig.disableAll,None
)
      

,TutorialStep("Registros"
,"""
  
<p>En VonSim tenemos dos lugares para almacenar información: la memoria y los registros.
La memoria permite guardar mucha más información, pero el acceso a la misma desde la CPU es 
más lento; en cambio, los registros son pocos pero su acceso es prácticamente instantáneo para la CPU.
</p>
<p>La CPU de VonSim tiene 4_ registros de propósito general, es decir, que sirven para cualquier cosa.</p>
<p> Los registros se llaman ax, bx, cx y dx. Cada uno guarda un valor de 16_ bits (2_ bytes).<p> 
<p> Cuando se comienza a ejecutar un programa, el simulador le pone el valor 0 a ambos bytes de estos registros.</p>
<p> Puedes observar su valor en la pantalla del simulador.</p>

""",UIConfig.disableAll,None
)


,TutorialStep("Registros y mov (parte 1_)"
,"""
<p> Se puede asignar un valor a un registro con la instrucción mov.</p>

<p> Dicha instrucción tiene la sintaxis <code>mov registro, valor</code></p>
<p> Por ejemplo, <code>mov ax,2</code> pone el valor 2 en el registro ax, o <code>mov cx,12</code> pone el valor 12 en el registro cx.</p>
<p class="exercise"> Ejecuta el código del editor, y verifica que al registro ax se le asigna el valor 5.</p>
<p class="exercise"> Agrega una instrucción mov al programa para que el registro dx tenga el valor 3.</p>
""",UIConfig.enableAll,Some("org 2000h\nmov ax,5\nhlt\nend")
)

,TutorialStep("Registros y mov (parte 2_)"
,"""
<p class="exercise"> Escribe un programa que le asigne el valor 16 al registro ax,
 el valor 16h al registro bx, el 3A2h al cx 
 y el 120 al registro dx.</p>
<p>Recuerda que puedes ingresar valores en decimal, hexadecimal o binario, pero el simulador
siempre los muestra codificados en hexadecimal.</p>
<div class="answer"><p>El código a ingresar es:</p>
<pre><code>mov ax,16
mov bx,16h
mov cx,3a2h
mov dx,120 
</code></pre>
</div> 
""",UIConfig.enableAll,Some("org 2000h\n\nhlt\nend")
)

,TutorialStep("Registros y mov (parte 3_)"
,"""<p>También se puede mover el valor de un registro a otro registro</p>
  
<p> Por ejemplo, podemos ponerle el valor 5 a bx, y luego pasar el valor de bx a cx para que ambos valgan 5.<p> 

<p> Para ello, después de <code>mov bx,5</code> debemos ejecutar <code>mov cx,bx</code>.</p>

<p> Es decir, le pasamos a cx el valor de bx.</p>

<p class="exercise"> Prueba el código del editor, que hace lo descripto más arriba.</p>
<p class="exercise"> Agrega una línea al programa para copiar también el valor del registro 
bx al registro dx.</p>
<p class="answer"> La línea a agregar es <code>mov dx,bx</code></p>
 <p class="exercise"> Ejecuta el programa y verifica que los 
 tres registros (bx, cx y dx) terminan con el mismo valor (5h).</p>
""",UIConfig.enableAll,Some("org 2000h\nmov bx,5\nmov cx,bx\nhlt\nend")
)

,TutorialStep("Registros y mov (parte 4)"
    
    
,"""<p> Entonces la instrucción mov también puede usarse con la sintaxis <code>mov registro, registro</code></p>
  
  <p>Algo que no se puede hacer es mover el valor de un registro hacia un valor</p>
  
<p> Por ejemplo, la instrucción <code>mov 3, bx</code> es inválida.</p> 



<p class="exercise"> Prueba dicho código en el editor de código; el programa no compilará.</p>

<p> Entonces, podemos concluir que la sintaxis <code>mov valor, registro</code> es inválida,
o sea que el orden de los operandos es importante.</p>

""",UIConfig.enableAll,Some("org 2000h\nhlt\nend")
)
  
,TutorialStep("Parte alta y parte baja de un registro."
       
,"""<p> Los registros ocupan 2 bytes o 16 bits. Al byte más significativo se lo llama 
<strong>parte alta</strong>, y al menos significativo, <strong>parte baja</strong>.</p>

<p>Por ejemplo, si ax tiene el valor 3A4Fh, entonces el byte más significativo o parte alta
vale 3Ah, y el byte menos significativo o parte baja vale 4Fh.</p>

<p class="exercise"> Lee y prueba el código del editor. ¿Cómo queda almacenado el valor
3A4Fh en el registro ax? ¿Cuál es la parte alta? ¿Y la baja?
</p>

<p class="answer">
  La parte baja está en la primera fila: dicha fila está etiquetada con <strong>L</strong>, por
  <strong>Low</strong> (bajo en inglés).
  
   La parte baja está en la segunda fila: dicha fila está etiquetada con <strong>H</strong>, por
  <strong>High</strong> (alto en inglés).  
</p>

  
""",UIConfig.enableAll,Some("org 2000h\nmov ax,3A4Fh\nhlt\nend")
)

,TutorialStep("Modificando las partes altas y bajas de un registro."
       
,"""<p>En ocasiones, queremos manejar datos que sólo ocupan 8_ bits, y no necesitamos
toda la capacidad de un registro completo de 16_ bits.</p>

<p>En esos casos podemos acceder o cambiar sólo la parte alta o baja de los registros.</p>

<p> Para cambiar el valor de un registro entero utilizamos los identificadores ax, bx, cx o dx.
</p>

<p> Pero también podemos cambiar sólo la parte alta o la parte baja utilizando otros identificadores.
Para el registro ax, podemos utilizar los identificadores _al y ah, para acceder a la parte 
baja y a la parte alta de al directamente.
</p>

<p class="exercise">
Lee y ejecuta el código del editor. ¿Cómo se modifica el registro ax?
</p>

<div class="answer">
<p>
El registro ax termina con el valor 5A94h, ya que en la parte alta (ah) se cargó el valor 5Ah,
y en la parte baja (_al) se cargó el valor 94h.
</p>

<p>
De la misma forma, podemos acceder a las partes altas y bajas de bx con bl y bh, de cx con cl y ch
y de dx con dl y dh.
</p>
</div>

""",UIConfig.enableAll,Some("org 2000h\nmov ah,5Ah\nmov al,94h\nhlt\nend")
)

,TutorialStep("Independencia de los registros bajos y altos."
       
,"""<p class="exercise">
  El código del editor tiene una instrucción que modifica todo el registro ax de una sola vez,
  y otra que modifica solo su parte baja. Léelo y ejecútalo para ver cuáles
  son los valores finales de los registros.
  </p>

<div class="answer"> 
<p>
El primer mov cambia el valor de todo el registro ax, tanto de 
su parte alta como de su parte baja. Por otro lado, el segundo mov sólo
cambia la parte baja. La parte alta sigue valiendo 5Ah, es decir, no se modificó.
</p>
<p>
Por ende, podemos decir que cuando se accede directamente a la parte baja de ax utilizando
el identificador al, en verdad estamos viendo a al como un registro independiente. Es decir,
podríamos considerar que tenemos 4_ registros de 16_ bits (ax, bx, cx y dx) u 8_ registros de 8_ bits
(_al, ah, bl, bh, cl, ch, dl y dh) según nos convenga cuando escribimos el programa. 
 </p>
</div>

""",UIConfig.enableAll,Some("org 2000h\nmov ax,5AC3h\nmov al,94h\nhlt\nend")
)

,TutorialStep("Modificando las partes altas y bajas de un registro."
       
,"""<p class="exercise">
  Lee el código e intenta determinar cuales serán los valores finales de los registros
  cuando termine el programa. Luego ejecuta el código y comprueba el resultado.
  </p>

""",UIConfig.enableAll,Some("""org 2000h
mov bx,12
mov bh,1Ah
mov ah,5Ah
mov al,94h
mov cx,57h
mov cl,al
mov dl,12h
mov dh,10
mov dx,321h
hlt
end""")
)

,TutorialStep("Instrucción add (sumar)"
,"""<p>Además de la instrucción mov mov, tenemos la instrucción add 
  (<em>sumar</em> en inglés) que nos permite sumar dos números.</p>
  
<p> La sintaxis de dicha instrucción es <code>add registro, valor</code> <p>

<p> Por ejemplo, para sumarle 3 al registro ax, escribimos <code>add ax, 3</code>. Si antes tenía el valor 4
ahora tendrá el valor 7. </p>

<p class="exercise">Lee y ejecuta el código del editor; verifica que ax termina con el valor 7.</p>

<p class="exercise"> Luego agrega dos líneas; una para ponerle el valor 4
 al registro bx, y otra para sumarle 2.</p>
<div class="answer">
<p> Las líneas a agregar son: </p>
<pre><code>mov bx,4
add bx,2</code></pre>
</div>

""",UIConfig.enableAll,Some("org 2000h\nmov ax,4\nadd ax,3\nhlt\nend")
)

,TutorialStep("Instrucción add con dos registros"
,"""<p>La instrucción add también nos permite sumar dos registros</p>
 <p> Entonces, <code>mov ax,bx</code> suma el valor de ax y el de bx<p> 
<p>El resultado queda almacenado en ax.</p>
<p class="exercise">Lee y ejecuta el código del editor; verifica que ax termina con el valor 7.</p>

<p class="exercise">Agrega dos líneas al programa para darle el valor 2 a cx y luego sumarle cx a bx.
El valor final del registro bx debería ser 5. </p>

<div class="answer">
<p> Las líneas a agregar son: </p>
<pre><code>mov cx,2
add bx,cx</code></pre>
</div>

""",UIConfig.enableAll,Some("org 2000h\nmov ax,4\nmov bx,3\nadd ax,bx\nhlt\nend")
)

,TutorialStep("Otras instrucciones aritméticas y lógicas"
,"""<p>También hay otras instrucciones aritméticas y lógicas en el simulador.</p>
<p>Las más comunes son sub (por <em>substract</em>, en inglés), para restar o sustraer,
 y or, xor y and que hacen lo mismo que su equivalente lógico.
<p> 
<p class="exercise">
Lee y ejecuta el código del editor, que utiliza instrucciones lógicas para calcular valores
en los registros ax, bx, cx y dx. Observa el resultado.
</p>
<p class="answer">
Las instrucciones or, xor y and aplican bit a bit las
operaciones binarias del mismo nombre. La instrucción sub hace lo mismo que el 
add pero restando. 
</p>
""",UIConfig.enableAll,Some("""org 2000h
; sub, resta
mov ax,4
sub ax,3
;or
mov bl,11010010b
or bl,10101010b
;xor
mov cl,11010010b
xor cl,10101010b
;and
mov dl,11010010b
and dl,10101010b
hlt
end""")
)

,TutorialStep("La instrucción not:."
    
    
,"""<p> La instrucción not nos permite invertir el patrón de bits de un registro.</p>

<p> Por ejemplo, si al vale 11011001b, aplicando el not pasa a valer 00100110b.
</p>
  
<p>A diferencia de las otras instrucciones que vimos que son <em>binarias</em>, es decir,
tienen dos operandos, el not es <em>unario</em>, o sea que tiene un solo operando.
Su sintaxis es simplemente <code>not registro</code>.</p>

<p class="exercise"> Lee y ejecuta el código del editor. Verifica el valor final del registro al.</p>

""",UIConfig.enableAll,Some("org 2000h\nmov al, 11011001b\nnot al\nhlt\nend")
)

,TutorialStep("La instrucción neg: multiplicar por -1."
    
,"""<p> La instrucción neg es similar al not, 
  ya que también es unaria.</p>

<p>
Nos permite multiplicar a un número por menos uno, es decir, negarlo.
</p>
  

<p class="exercise">
Lee y ejecuta el código del editor. Verifica que los resultados finales sean correctos.
Recuerda que los números negativos se almacenan codificados en CA2. 
  </p>

""",UIConfig.enableAll,Some("org 2000h\nmov bl,-4\nneg bl\nmov ch,7\nneg ch\nhlt\nend")
)

,TutorialStep("inc y dec" 
    
,"""<p> Cuando sumamos y restamos, algo muy común es que sumemos o restemos uno.</p>

<p>
Por ejemplo, si queremos sumarle 1 al registro ax y restarle 1 al registro bl, podemos escribir
<code>add ax,1</code> y <code>sub bl,1</code>.
</p>
 
<p>
Estas operaciones de sumar uno o restar uno son 
muy comunes. Por eso, el simulador tiene instrucciones especiales que se llaman inc 
y dec que hacen justamente eso. La primera incrementa un registro en uno y la otra lo decrementa
</p>
  
<p class="exercise">
Lee y ejecuta el código del editor. Verifica que los resultados finales sean correctos. 
</p> 

""",UIConfig.enableAll,Some("org 2000h\nmov ax,5\ninc ax\nmov bl,20\ndec bl\nhlt\nend\n")
)

,TutorialStep("Realizando cálculos aritméticos"
    
,"""<p> Podemos realizar cálculos con algunas de las instrucciones vistas. </p>

<p class="exercise">
Lee y ejecuta el código del editor, que realiza una cuenta que se guarda finalmente
en el registro cx. ¿Qué cálculo está realizando?
</p>
  
<p class="answer">
Al ejecutar las dos líneas de asignación inicial, sabemos que ax=30 y bx=15. 
Luego se le suma 12 a ax, por ende ax=42. Después se le resta
1 a bx con el dec, entonces bx=14. Finalmente se le resta bx a ax, llegando
a ax=28. Luego se pasa el valor de ax a cx, con lo que cx=28, que en hexadecimal es 1Ch.
En resumen, hicimos que cx = (a+12)-(b-1), donde a y b son los valores iniciales de ax y bx.
</p> 

""",UIConfig.enableAll,Some("""org 2000h
; asignacion inicial
mov ax,30
mov bx,15
;calculos
add ax,12
dec bx
sub ax,bx
; asignacion del resultado en cx
mov cx,ax
hlt
end""")
)

,TutorialStep("Realizando cálculos aritméticos"
    
,"""

<p class="exercise">
Escribe un programa en base a los valores iniciales de ax y bx, calcule
cx = (b+1)+(a-3), donde a y b son los valores iniciales de ax y bx. 
</p>
  
<div class="answer">
<p>Una implementación posible (puede haber otras) para ese cálculo es:</p>
<pre><code>;calculos
inc bx
sub ax,3
add bx,ax
; asignacion del resultado en cx
mov cx,bx</pre></code>
</div> 

""",UIConfig.enableAll,Some("""org 2000h
; asignacion inicial
mov ax,21
mov bx,35
;calculos

; asignacion del resultado en cx

hlt
end""")
)

,TutorialStep("Aplicando máscaras binarias"
    
,"""<p> Podemos aplicar máscaras binarias con algunas de las instrucciones vistas. </p>

<p class="exercise">
Lee y ejecuta el código del editor, que utiliza instrucciones lógicas para aplicar 
máscaras binarias. ¿Qué está calculando?
</p>
  
<div class="answer">

<p>El programa aplica las siguientes máscaras</p>
<pre>    10010111
xor 11110010
    --------
    01100101
and 11111011
    --------
or  01100001
    00000010
    --------
not 01100011
    --------    
    10011100
</pre>
</div> 

""",UIConfig.enableAll,Some("""org 2000h
; asignacion inicial
mov al,10010111b
;mascaras
xor al,11110010b
and al,11111011b
or  al,00000010b
not al
hlt
end""")
)

,TutorialStep("Aplicando máscaras binarias"
    
,"""

<div class="exercise">
<p>
Escribe un programa que aplique varias máscaras al registro _al, con valor inicial 10101010b.
<p>
</p> 
Primero,utilizar un and con la máscara 01111111b para hacer que el bit 7_ 
(el más significativo) se convierta en 0 y el resto quede igual.
</p>
<p>
Luego aplicar un or con la máscara 00000100b para hacer que el bit 2_
se convierta en 1. Después, invierte todos los bits.
</p> 
<p>Finalmente, aplica un xor
con la máscara 11110000b para invertir los 4_ bits más significativos y dejar igual los otros.  
</p>
</div>
  
<div class="answer">
<pre>
<code>and _al, 01111111b
or  _al, 00000100b
not _al
xor _al, 11110000b
</code>
</pre>
</div> 

""",UIConfig.enableAll,Some("""org 2000h
; asignacion inicial
mov al,10101010b
;aplicación de máscaras

hlt
end""")
)


,TutorialStep("Resumen"
    
,"""<p> VonSim tiene 4_ registros llamados ax, bx, cx y dx.
  Los registros ocupan 2_ bytes o 16_ bits. Al byte más significativo se lo llama 
<strong>parte alta</strong>, y al menos significativo, <strong>parte baja</strong></p>

<p> Cada registro puede accederse o modificarse completo utilizando
 ax, bx, cx o dx como identificador. 
También se pueden utilizar las partes altas y bajas de forma independiente, con
_al, ah, bl, bh, cl, ch, dl y dh como identificadores.
</p>
  
<p>
Hay varias instrucciones para modificar registros. Tenemos add, sub, inc y dec, para sumar y restar,
or, xor, and y not, para realizar operaciones lógicas, y neg para hacer negativo (o positivo)
 un número.
</p>

 <p>
Dichas instrucciones pueden operar tanto en un registro completo como ax, como en partes 
del mismo, como _al y ah.
</p> 

 <p>
Podemos utilizar varias instrucciones aritméticas para realizar cálculos.
Asimismo podemos utilizar varias instrucciones lógicas para aplicar máscaras de bits.
</p> 

""",UIConfig.enableAll,Some("org 2000h\nhlt\nend")
)


)




}