---
title: Notas de versión
---

# {{ $frontmatter.title }}

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
