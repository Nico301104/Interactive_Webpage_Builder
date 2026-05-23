@echo off
echo ============================================================
echo  IWB — Setup Complet (Backend + Frontend)
echo ============================================================

REM 1. Virtual environment
python -m venv venv
if errorlevel 1 (echo EROARE: Python nu e instalat & pause & exit /b 1)
call venv\Scripts\activate.bat

REM 2. Dependente
pip install -r requirements.txt

REM 3. .env
if not exist .env (
    copy .env.example .env
    echo.
    echo  ATENTIE: A fost creat .env — editeaza SECRET_KEY!
    echo.
    pause
)

REM 4. Migrari
python manage.py migrate

REM 5. Colecteaza fisiere statice (JS frontend)
python manage.py collectstatic --noinput

REM 6. Superuser optional
set /p SU="Creezi superuser? (y/n): "
if /i "%SU%"=="y" python manage.py createsuperuser

echo.
echo  =============================================
echo  Server pornit!
echo  App:    http://127.0.0.1:8000/
echo  Admin:  http://127.0.0.1:8000/admin/
echo  API:    http://127.0.0.1:8000/api/
echo  =============================================
echo.
python manage.py runserver
