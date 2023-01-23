# Pila

La [pila](<https://es.wikipedia.org/wiki/Pila_(inform%C3%A1tica)>) (_stack_) es una estructura de datos que permite almacenar y recuperar datos en memoria. Tiene la peculiaridad de que su modo de acceso es _Last In, First Out_: el último en entrar es el primero en salir. Al igual que una pila de papeles, se puede apilar papeles encima de todo o quitar papeles desde el tope — nunca desde el medio.

En el simulador, cada elemento de la pila ocupa 16 bits (dos celdas de memoria). El tope de la pila se guarda en el registro `SP` (_stack pointer_) y este se inicializa en `4000h` (la dirección de memoria más grande es `3FFFH`).

Para apilar, se utiliza la instrucción [`PUSH`](./instrucciones/transferencia-de-datos#push). Internamente, ejecutar una instrucción `PUSH` es similar a hacer

```asm
; Este código es didáctico, no corre en VonSim

SUB SP, 2         ; Disminuye el Stack Pointer en 2
MOV [SP], fuente  ; Copia los contenidos de fuente a donde apunte el SP
```

Para desapilar, se utiliza la instrucción [`POP`](./instrucciones/transferencia-de-datos#pop). Internamente, ejecutar una instrucción `POP` es similar a hacer

```asm
; Este código es didáctico, no corre en VonSim

MOV dest, [SP]    ; Copia los contenidos de la celda a la que apunta SP en dest
ADD SP, 2         ; Incrementa el Stack Pointer en 2
```
