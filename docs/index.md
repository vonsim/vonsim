# ¿Qué es VonSim?

VonSim es una herramienta destinada a la enseñanza y aprendizaje de arquitectura y organización de computadoras. Consta de un entorno para desarrollar programas en lenguaje ensamblador (_Assembly_ o _Assembler_) y de un simulador para los mismos.

La arquitectura de VonSim es una [simplificación](/diferencias-con-la-realidad) del procesador 8086/8088 de Intel. Está basado en MSX88, desarrollado por la Universidad Politécnica de Madrid.

El emulador cuenta con
- canales de 16 bits y memoria de tipo byte (8 bits) y word (16 bits);
- una memoria que va desde `0000h` hasta `3FFFh`;
- cuatro registros multipropósito de 16 bits: `AX`, `BX`, `CX` y `DX`, y cada uno está divido en su parte low (`AL`) y high (`AH`) de 8 bits cada una;
- una ALU de 16 bits con las flas C (carry), O (overflow), S (sign) y Z (zero);
- representación automática de números negativos como complemento a 2 (Ca2).