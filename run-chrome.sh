#!/usr/bin/env bash

pepperFlashArg="--ppapi-flash-path=/usr/lib/flashplugin-installer/libflashplayer.so"
remoteDebugPort=9222
chromeBinary="google-chrome-beta"


if [ "$1" = "headless" ]; then
   google-chrome-beta --headless --disable-gpu --remote-debugging-port=9222
else
    google-chrome-beta --remote-debugging-port=9222
fi