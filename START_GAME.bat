@echo off
title MineRogue - Voxel Roguelike
color 0a
echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   M I N E R O G U E  ⚔️⛏️                ║
echo  ║   A Voxel Roguelike                      ║
echo  ╚═══════════════════════════════════════════╝
echo.
echo  Starting game server...
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  Installing dependencies first...
    call npm install
    echo.
)

:: Build for production
echo  Building game...
call npm run build
echo.

:: Start preview server and open browser
echo  Launching on http://localhost:4173
echo  Press Ctrl+C to stop.
echo.
start "" http://localhost:4173
call npm run preview
