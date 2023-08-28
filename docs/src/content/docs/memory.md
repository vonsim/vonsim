---
title: Memoria principal
head:
  - tag: meta
    attrs: { property: og:image, content: https://vonsim.github.io/docs/og/memory.png }
---

El simulador cuenta con una memoria principal de almacenamiento. Esta memoria cubre el espacio de direcciones `0000h` hasta `FFFFh`. La mitad más baja (`0000h` hasta `7FFFh`) está reservada para el usuario: aquí se almacenan los programas y datos. La mitad más alta (`8000h` hasta `FFFFh`) está reservada para un sistema operativo muy simple que permite al usuario interactuar con varios dispositivos (ver [llamadas al sistema](/docs/cpu/#llamadas-al-sistema)).

Nótese que, al contrario que en el procesador Intel 8088, la memoria principal no está dividida en segmentos. Por eso, el programador debe tener cuidado de no sobrepasar los límites de la memoria ni que otros programas sobreescriban su código o datos.

---

<small>Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</small>
