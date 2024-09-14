# Switches and LEDs

The switches or toggles are connected to the `PA`/`CA` port of the [PIO](../modules/pio) and are input devices. When their state changes, this will be reflected in `PA` (if the PIO is configured correctly). If `PA` is altered, the changes will not be reflected in the switches (they do not move on their own, so to speak).

The lights or LEDs are connected to the `PB`/`CB` port of the [PIO](../modules/pio) and are output devices. The only way to change their state is by modifying `PB`. These changes will be reflected in the lights if the PIO is configured correctly; otherwise, the lights will appear to be off.
