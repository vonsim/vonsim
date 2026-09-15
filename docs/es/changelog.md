# Notas de versión

### 15 de septiembre de 2026

- Se agregó la llamada al sistema `INT 5` para generar un número aleatorio entre 0 y `AL` (inclusive), almacenado en `AL`.

### 24 de septiembre de 2025

- Se agregó soporte para guiones bajos (`_`) como separadores de dígitos en números para mejorar la legibilidad, como `1111_0010b` o `1_000`.

### 30 de agosto de 2025

- Se agregó la posibilidad de compartir programas mediante enlaces URL con el código fuente codificado.
- Se agregó el control de tamaño de fuente directamente desde la barra de estado del editor.
- Se actualizaron los atajos de teclado para el control de la simulación (`F1` para ciclo, `F2` para instrucción, `F3` para ejecución continua, `F4` para detener).

### 25 de agosto de 2025

- Se agregó un modo claro junto con modo oscuro.
- Se rediseñaron los controles de la simulación para avanzar paso a paso.
- Se agregó soporte para comentarios de [`metadatos`](./reference/metadata) de programas en el código fuente para configurar dispositivos requeridos automáticamente y documentar información del programa.
- Se agregó una galería integrada de programas de ejemplo.

### 26 de diciembre de 2024

- El temporizador ahora comienza a contar después de la primera escritura en el registro `CONT`.
- El búfer de la impresora se vacía automáticamente al finalizar la simulación.

### 20 de septiembre de 2024

- Se agregó la instrucción [`TEST`](./computer/instructions/test).
- Se agregó el acceso indirecto a memoria con desplazamiento. Por ejemplo, `mov al, [bx+8]`.

### 31 de julio de 2024

Se cambió la forma de agregar dispositivos. El usuario ya no elige configuraciones sino que puede escoger los dispositivos arbritariamente.

### 10 de septiembre de 2023

Las direcciones del vector de interrupciones utilizadas por el sistema ahora se encuentran protegidas. Si el usuario intenta escribirlas, se producirá un error.

### 22 de agosto de 2023

¡Lanzamiento de la nueva versión de VonSim! Con respecto a la versión anterior, esta versión incluye:

- animaciones para las microinstrucciones;
- soporte para celulares y tablets;
- documentación accesible desde la aplicación;
- modo offline (PWA);
- editor de texto más avanzado, con soporte para abrir y guardar archivos;

Se hicieron muchos cambios internos sobre la arquitectura de VonSim. Los más importantes para el usuario son:

- ensamblador más inteligente, que detecta errores de sintaxis y semántica arrojando mensajes de error más claros y específicos;
- sporte para acceso directo a memoria, como `mov al, [1234h]`;
- soporte para caracteres literales, como `cmp al, '0'`;

### 2019

Se agregó la entrada/salida al simulador.

### 2017

Primera versión de VonSim. Actualmente guarda en la rama [`legacy`](https://github.com/vonsim/vonsim/tree/legacy). Comparado con el MSX88, esta versión:

- es web, por lo que no requiere instalación y es multiplataforma;
- tiene una interfaz gráfica más moderna;
- tiene un editor de texto con resaltado de sintaxis integrado.

### 1988

Rubén de Diego Martínez lanza el simulador MSX88 para la Universidad Politécnica de Madrid.
