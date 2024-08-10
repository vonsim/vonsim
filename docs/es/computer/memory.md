# Memoria principal

El simulador cuenta con una memoria principal de almacenamiento. Esta memoria cubre el espacio de direcciones `0000h` hasta `FFFFh`. La mitad más baja (`0000h` hasta `7FFFh`) está reservada para el usuario: aquí se almacenan los programas y datos. La mitad más alta (`8000h` hasta `FFFFh`) está reservada para un sistema operativo muy simple (llamado _monitor_) que permite al usuario interactuar con varios dispositivos (ver [llamadas al sistema](./cpu#llamadas-al-sistema)).

Nótese que, al contrario que en el procesador Intel 8088, la memoria principal no está dividida en segmentos. Por eso, el programador debe tener cuidado de no sobrepasar los límites de la memoria ni que otros programas sobreescriban su código o datos.
