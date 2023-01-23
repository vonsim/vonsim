# Interrupciones por software

Las interrupciones por software son interrupciones que hace el programa al sistema operativo y se invocan con la instrucción `INT`.

El simulador soporta las siguientes interrupciones por software:

- `INT 0`: termina la ejecución del programa.
- `INT 3`: incia el modo de depuración (_breakpoint_).
- `INT 6`: lee un carácter de la [consola](./dispositivos/consola.md).
- `INT 7`: escribe caracteres en la [consola](./dispositivos/consola.md).
