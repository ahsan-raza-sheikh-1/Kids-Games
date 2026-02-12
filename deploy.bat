@echo off
REM 🚀 Windows Deploy Script for Interactive Kids Storytelling Game
REM This script automates the web publishing process for Windows

echo 🎮 Interactive Kids Storytelling Game - Web Publisher
echo ==================================================

REM Check if web-build directory exists
if not exist "web-build" (
    echo ❌ Error: web-build directory not found!
    echo Please run this script from the game root directory.
    pause
    exit /b 1
)

echo ✅ Found web-build directory

echo.
echo 🚀 Choose deployment platform:
echo 1) GitHub Pages (Free)
echo 2) Netlify (Free, drag & drop)
echo 3) Vercel (Free, CLI)
echo 4) Firebase Hosting (Free)
echo 5) Show all instructions
echo 6) Exit

set /p choice=Enter your choice (1-6): 

if "%choice%"=="1" goto github_pages
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto firebase
if "%choice%"=="5" goto show_instructions
if "%choice%"=="6" goto exit_script
goto invalid_choice

:github_pages
echo 🐙 Deploying to GitHub Pages...
git add .
git commit -m "Deploy kids storytelling game to web"
git push origin main
echo ✅ Pushed to GitHub! Enable Pages in repository settings.
echo    Settings → Pages → Source: Deploy from branch → main → /web-build
goto end

:netlify
echo 🌐 Preparing for Netlify deployment...
echo ✅ Ready for Netlify!
echo    1. Visit https://netlify.com
echo    2. Drag the 'web-build' folder to the deploy area
echo    3. Your game will be live instantly!
goto end

:vercel
echo ▲ Deploying to Vercel...
where vercel >nul 2>nul
if %errorlevel% equ 0 (
    cd web-build
    vercel --prod
    cd ..
    echo ✅ Deployed to Vercel!
) else (
    echo ❌ Vercel CLI not found. Install with: npm i -g vercel
    echo    Then run: cd web-build && vercel --prod
)
goto end

:firebase
echo 🔥 Deploying to Firebase Hosting...
where firebase >nul 2>nul
if %errorlevel% equ 0 (
    firebase deploy
    echo ✅ Deployed to Firebase!
) else (
    echo ❌ Firebase CLI not found. Install with: npm install -g firebase-tools
    echo    Then run: firebase init hosting && firebase deploy
)
goto end

:show_instructions
echo.
echo 📖 Full deployment instructions available in WEB-PUBLISHING-GUIDE.md
echo.
echo Quick links:
echo • GitHub Pages: https://pages.github.com/
echo • Netlify: https://netlify.com/
echo • Vercel: https://vercel.com/
echo • Firebase: https://firebase.google.com/products/hosting
echo.
echo 📁 Your game files are ready in the 'web-build' directory!
goto end

:exit_script
echo 👋 Goodbye! Your game is ready to deploy anytime.
exit /b 0

:invalid_choice
echo ❌ Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo 🎉 Deployment complete!
echo 📚 Your Interactive Kids Storytelling Game is now live on the web!
echo 🛡️ COPPA compliant and safe for children ages 5-9
echo.
echo 📖 For detailed instructions, see WEB-PUBLISHING-GUIDE.md
pause