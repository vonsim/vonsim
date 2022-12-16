# Diferencias con el Intel 8088

VonSim no es una representación fiel del procesador Intel 8088. Sin embargo, basa su funcionamiento en el mismo. Desde el vamos, solo están implementadas [algunas instrucciones](/como-usar/instrucciones/listado): las que nosotros consideramos escenciales para el aprendizaje.

En el VonSim no existe separación entre los datos, el código ejecutable y la pila. Esto es con el fin de simplificar el funcionamiento del mismo. En el 8088, hay una separación (lógica, no física) de estos, los llamados "code segment", "stack segment", "data segment" y "extra segment". Esta sepación le permite a los programas no tener que preocuparse por pisarse a ellos mismo (cosa que puede pasar en el VonSim).

Además, gracias a lo explicado, el 8088 puede permitirse tener una memoria de 1 MiB que necesita de un canal de 20 bits para acceder a todas sus celdas pero solo necesitar un canal de 16 bit más estándar. Como VonSim carece de eso, cuenta con una memoria útil que solo va desde `0000h` hasta `3FFFh`.

## Referencias

- [Especificaciones del 8086](/8086_Intel.pdf) (0,6 MB)
- [Especificaciones del 8088](/231456-006.pdf) (0,4 MB)
- [Manual del MSX88](/Manual-MSX88.pdf) (0,4 MB)
- [Paper original del MSX88](/msx88-original-paper.pdf) (3,1 MB)