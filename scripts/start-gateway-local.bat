@echo off
setlocal
wsl -d Debian -- bash -lc "cd /mnt/d/Github/ZeroClaw-Vbee-Automate && ./scripts/start-gateway-local.sh"
endlocal
