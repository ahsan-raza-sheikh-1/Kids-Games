@echo off
echo Preparing for build and deployment...

:: Install dependencies
echo Installing dependencies...
call npm install

echo.
echo ==========================================
echo Project prepared at root directory!
echo Everything is ready for Netlify deployment.
echo ==========================================
pause
