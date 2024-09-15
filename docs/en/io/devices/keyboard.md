# Keyboard

The keyboard is an input device that allows the user to enter characters into the system. The way to communicate with the keyboard is through a [system call](../../computer/cpu#system-calls). This is done for simplicity, as a real keyboard is much more complex.

With the call `INT 6`, the execution of the code is halted until a key is pressed on the keyboard. The corresponding character will be stored in the memory address stored in `BX` according to its ASCII representation.

```vonsim
org 1000h
char db ?

org 2000h
mov bx, offset char
int 6
; The user types a character
int 0
end

; The character written is stored in 'char'.
; For example, if the user pressed the 'a' key, then
; the value 61h is stored in 'char'.
```
