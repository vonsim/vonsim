;; name    = Convertir un string a minúscula y mostrar en pantalla
;; author  = Facundo Quiroga
;; date    = 2025-08-25
;; devices = keyboard, screen
;; tags = string, minúscula, mostrar

;Escribir un programa que lea un string, lo almacene en 
;MENSAJE y convierta todos sus carácteres a minúscula.  
;Por ejemplo, si MENSAJE contiene “Hola, Buenas Tardes”, 
;luego de la conversión debe contener “hola, buenas tardes”. 
;Mostrar en pantalla el mensaje luego de la conversión. 
;Para ello, debe implementar y utilizar las siguientes subrutinas:

; 📄 ES_MAYUS ⭐ Recibe un carácter en el registro AL y retorna 
;en AH el valor 0FFh si es mayúscula y 0 de lo contrario. 
;Pista: Los códigos de las mayúsculas son todos consecutivos. 
;Buscar en la tabla ASCII los caracteres mayúscula, 
;y observar qué valores ASCII tienen la ‘A’ y  la ‘Z’.
; 📄 A_MINUS ⭐ Recibe un carácter mayúscula en AL y lo devuelve como minúscula. 
;Pista: Las mayúsculas y las minúsculas están en el mismo orden en el ASCII, 
;y por ende la distancia entre, por ejemplo, la “A” y la “a” es la misma 
;que la distancia entre la “Z” y la “z”.
; 📄 STRING_A_MINUS ⭐⭐ Recibe la dirección de comienzo de un string en BX, 
; su longitud en AL. Recorre el string, cambiando a minúscula 
;las letras que sean mayúsculas. 
;No retorna nada, sino que modifica el string directamente en la memoria.



ORG 1000H
MENSAJE db "Hola, Buenas Tardes"
FIN db ?

ORG 3700H
A_MIN: ADD AL, 20H
       RET


; es_mayus: Recibe un carácter en el registro AL 
; y retorna en AH el valor 0FFh si es mayúscula y 0 de lo contrario. 

ORG 3500H  
ES_MAYUS: MOV AH, 0
          CMP AL, 'A'
          JS NO_ES
          MOV DH, 'Z'
          CMP DH, AL
          JS NO_ES
          MOV AH, 0FFH 
   NO_ES: RET


;la subrutina debe recibir en bx la dir del string
; y en al la logitud

ORG 3000H 
STRING_A_MINUS: MOV CL, AL    ;tamaño string lo paso a cl ya que a al lo voy a necesitar
        VUELVO: MOV AL, [BX] 
                CALL ES_MAYUS
                CMP AH, 0
                JZ SIGO       ;si AH=0, entonces SIGO ya que es minuscula
                CALL A_MIN
                MOV [BX], al
          SIGO: INC BX
                DEC CL
                JNZ VUELVO
                RET
    

ORG 2000H
MOV BX, OFFSET MENSAJE
MOV AL, OFFSET FIN - OFFSET MENSAJE
CALL STRING_A_MINUS
MOV BX, OFFSET MENSAJE
MOV AL, OFFSET FIN - OFFSET MENSAJE
INT 7
INT 0
END
