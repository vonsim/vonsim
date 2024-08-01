---
title: INT
---

# {{ $frontmatter.title }}

Esta instrucción emite una [interrupción](../cpu#interrupciones) por software. El [_flag_](../cpu#flags) `IF` cambia a `0` obligatoriamente porque se va a ejecutar una interrupción. Los demás _flags_ no se modifican.

## Uso

```vonsim
INT N
```

_N_ es el número de interrupción (0-255), que debe ser inmediato (ver [tipos de operandos](../assembly#operandos)).

Utiliza el mismo mecanismo de vector de interrupciones que las interrupciones por hardware. Generalmente se utiliza para realizar [llamadas al sistema](../cpu#llamadas-al-sistema), pero si se la llama con cualquier otro número, se ejecutará la rutina de interrupción asociada a ese número.

## Codificación

`00011010`, _número de interrupción_
