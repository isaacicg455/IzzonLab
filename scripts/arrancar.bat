@echo off
echo Iniciando Izzon Lab Newsletter...

start "Backend" cmd /k "cd /d %~dp0..\backend && node index.js"

timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0..\frontend && npm start"
