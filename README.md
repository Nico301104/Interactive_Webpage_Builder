# IWB — Full Stack

Un editor drag-and-drop profesional pentru pagini web, complet integrat.

## Stack
- **Backend**: Django 5.2 + Django REST Framework + JWT
- **Frontend**: Vanilla HTML/CSS/JS + Tailwind CSS (CDN)
- **DB**: SQLite (development) / PostgreSQL (production)

## Pornire rapida (Windows)

```batch
setup.bat
```

## Pornire manuala

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
copy .env.example .env       # Editeaza SECRET_KEY!
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
python manage.py runserver
```

Deschide: **http://localhost:8000/**

## Structura proiect

```
iwb/
├── Web/                    ← Config Django (settings, urls, wsgi)
├── core/                   ← Modele de baza, validators, permissions
├── users/                  ← Auth JWT (register/login/logout/profile)
├── projects/               ← CRUD proiecte + versioning + share
├── editor/                 ← Operatiuni granulare pe layout
├── exporter/               ← JSON → HTML/CSS/JS
├── landing/                ← Endpoint public /api/
├── frontend/               ← SPA (servit ca fisiere statice)
│   └── js/
│       ├── api.js          ← Toate apelurile catre Django
│       ├── router.js       ← Hash router SPA
│       ├── toast.js        ← Notificari
│       └── pages/
│           ├── landing.js
│           ├── auth-page.js
│           ├── dashboard.js
│           ├── editor.js
│           └── share.js
├── templates/
│   └── index.html          ← SPA entry point (servit de Django)
├── manage.py
├── requirements.txt
└── .env.example
```

## API Endpoints

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/auth/register/` | Inregistrare |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/projects/` | Lista proiecte |
| POST | `/api/projects/` | Creeaza proiect |
| PATCH | `/api/projects/{id}/` | Actualizeaza |
| DELETE | `/api/projects/{id}/` | Sterge |
| GET | `/api/editor/projects/{id}/layout/` | Citeste layout |
| PUT | `/api/editor/projects/{id}/layout/` | Salveaza layout |
| POST | `/api/editor/projects/{id}/components/` | Upsert componenta |
| GET | `/api/export/{id}/?format=zip` | Export ZIP |
| GET | `/api/projects/shared/{token}/` | Pagina publica |

## Componente suportate (35)

`navbar`, `hero`, `section`, `container`, `columns`, `footer`,
`text`, `heading`, `richtext`, `blockquote`, `code_block`, `icon`, `badge`,
`image`, `video`, `embed`, `gallery`, `logo_strip`,
`button`, `link`, `social_links`, `form`, `countdown`,
`features`, `pricing`, `testimonials`, `faq`, `cta`, `team`, `stats`,
`card`, `cards_grid`, `timeline`, `tabs`, `contact`,
`divider`, `spacer`, `banner`

## Note tehnice

### Export endpoint
Foloseste `?type=zip` sau `?type=json` (NU `?format=` — e rezervat de DRF):
```
GET /api/export/{id}/?type=zip   → download ZIP
GET /api/export/{id}/?type=json  → preview JSON
```

### Migrații
Incluse în arhivă în:
- `users/migrations/`
- `projects/migrations/`
