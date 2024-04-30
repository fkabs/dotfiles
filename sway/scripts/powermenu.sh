#!/bin/bash

entries="Lock Logout Suspend Reboot Shutdown"

selected=$(printf '%s\n' $entries | wofi --conf=$HOME/.config/wofi/config_power --style=$HOME/.config/wofi/style_power.css | awk '{print tolower($1)}')

case $selected in
  lock)
    exec ~/.config/sway/scripts/lockman.sh;;
  logout)
    swaymsg exit;;
  suspend)
    exec systemctl suspend;;
  reboot)
    exec systemctl reboot;;
  shutdown)
    exec systemctl poweroff -i;;
esac
