@echo off
echo Comprobando requisitos...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Node.js no esta instalado.
    echo Se abrira la pagina de descarga en tu navegador.
    echo.
    echo INSTRUCCIONES:
    echo  1. Descarga el instalador recomendado ^(LTS^)
    echo  2. Ejecutalo y sigue los pasos
    echo  3. Reinicia el ordenador
    echo  4. Vuelve a ejecutar este archivo
    echo.
    start https://nodejs.org/es/download
    pause
    exit /b
)

echo Node.js encontrado. Instalando dependencias...

cd /d %~dp0..\backend
npm install

cd /d %~dp0..\frontend
npm install

echo.
echo Instalacion completada. Ya puedes usar arrancar.bat
pause
