# Screen

The screen is an output device that allows displaying characters. The way to communicate with the screen is through a [system call](../../computer/cpu#system-calls). This is done for simplicity, as a real screen is much more complex.

With the call `INT 7`, a string of characters is written to the screen. It receives two parameters:

- `AL`: length of the string to print
- `BX`: memory address where the string starts

```vonsim
org 1000h
string db "Hello!"

org 2000h
mov bx, offset string
mov al, 5
int 7
; "Hello!" (without quotes) is printed on the screen.
int 0
end
```

There are three special characters:

- The backspace character (`BS`, 8 in decimal) erases the previous character;
- The line feed character (`LF`, 10 in decimal) effectively prints a line break — useful for not printing everything on a single line;
- The form feed character (`FF`, 12 in decimal) clears the screen.
