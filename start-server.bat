@echo off
setlocal
cd /d "%~dp0"
echo Bravios starten - open http://localhost:8080 zodra de server draait.
echo Stop de server met Ctrl+C.
echo.
php -r "exit(PHP_VERSION_ID >= 80100 ? 0 : 1);" >nul 2>&1
if not errorlevel 1 goto php
py -3 -c "import http.server" >nul 2>&1
if not errorlevel 1 goto py
python -c "import http.server" >nul 2>&1
if not errorlevel 1 goto python
python3 -c "import http.server" >nul 2>&1
if not errorlevel 1 goto python3
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)" >nul 2>&1
if not errorlevel 1 goto node
echo Geen geschikte omgeving gevonden. Installeer Python 3, PHP 8.1+ of Node.js 18+.
echo Sluit dit venster en probeer opnieuw na installatie.
pause
exit /b 1

:php
php server/server.php
goto end
:py
py -3 server/server.py
goto end
:python
python server/server.py
goto end
:python3
python3 server/server.py
goto end
:node
node server/server.js
:end
set "server_status=%errorlevel%"
if not "%server_status%"=="0" pause
exit /b %server_status%
