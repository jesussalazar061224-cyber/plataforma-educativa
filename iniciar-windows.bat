@echo off
chcp 65001 >nul
title AdaptiClass
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Para usar AdaptiClass necesitas instalar Node.js, es gratis.
  echo   Se abrira la pagina de descarga: elige la version "LTS", instalala
  echo   con las opciones por defecto y luego vuelve a abrir este archivo.
  echo.
  start "" https://nodejs.org/es/download
  pause
  exit /b
)

if not exist ".env" copy ".env.example" ".env" >nul

node server.js --abrir
echo.
pause
