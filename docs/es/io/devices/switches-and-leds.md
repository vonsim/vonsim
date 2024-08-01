---
title: Llaves y luces
---

# {{ $frontmatter.title }}

Las llaves o interruptores están conectados al puerto `PA`/`CA` del [PIO](../modules/pio) y son dispositivos de entrada. Al cambiar su estado, estos se reflejarán en `PA` (si el PIO está configurado correctamente). Si se altera `PA`, los cambios no se verán reflejados en las llaves (no se mueven solas, por así decirlo).

Las luces o LED están conectadas al puerto `PB`/`CB` del [PIO](../modules/pio) y son dispositivos de salida. La única forma de cambiar su estado es modificando `PB`. Estos cambios se reflejarán en las luces si el PIO está configurado correctamente, de lo contrario, las luces se verán apagadas.
