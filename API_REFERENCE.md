# IWB — Referinta API

Base URL: `http://localhost:8000`

---

## Pornire rapida (Windows)

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # editeaza SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Auth  `/api/auth/`

| Metoda | Endpoint                      | Auth | Descriere                  |
|--------|-------------------------------|------|----------------------------|
| POST   | `/api/auth/register/`         | ✗    | Inregistrare + tokeni JWT  |
| POST   | `/api/auth/login/`            | ✗    | Login, primesti JWT pair   |
| POST   | `/api/auth/logout/`           | ✓    | Blacklist refresh token    |
| POST   | `/api/auth/token/refresh/`    | ✗    | Refresh access token       |
| GET    | `/api/auth/profile/`          | ✓    | Citeste profilul propriu   |
| PATCH  | `/api/auth/profile/`          | ✓    | Actualizeaza profilul      |
| PUT    | `/api/auth/change-password/`  | ✓    | Schimba parola             |

Header cerut pe rute protejate: `Authorization: Bearer <access_token>`

### Register
```json
{ "username": "ion", "email": "ion@ex.ro", "password": "Parola123!", "password2": "Parola123!" }
```

### Login — raspuns
```json
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": { "id": "...", "email": "ion@ex.ro", "username": "ion" }
}
```

---

## Proiecte  `/api/projects/`

| Metoda | Endpoint                                  | Descriere                        |
|--------|-------------------------------------------|----------------------------------|
| GET    | `/api/projects/`                          | Lista proiecte proprii           |
| POST   | `/api/projects/`                          | Creeaza proiect                  |
| GET    | `/api/projects/{id}/`                     | Detalii proiect                  |
| PATCH  | `/api/projects/{id}/`                     | Actualizeaza (auto-snapshot)     |
| DELETE | `/api/projects/{id}/`                     | Sterge proiect                   |
| GET    | `/api/projects/{id}/versions/`            | Listeaza versiuni                |
| POST   | `/api/projects/{id}/versions/restore/`    | Restaureaza o versiune           |
| POST   | `/api/projects/{id}/toggle-public/`       | Activeaza/dezactiveaza share     |
| POST   | `/api/projects/{id}/regenerate-token/`    | Genereaza token share nou        |
| POST   | `/api/projects/{id}/duplicate/`           | Dupilca proiectul                |
| GET    | `/api/projects/shared/{share_token}/`     | Vizualizare publica (fara auth)  |

---

## Editor  `/api/editor/`

| Metoda | Endpoint                                           | Descriere                         |
|--------|----------------------------------------------------|-----------------------------------|
| GET    | `/api/editor/projects/{id}/layout/`               | Citeste layout-ul complet         |
| PUT    | `/api/editor/projects/{id}/layout/`               | Suprascrie layout-ul complet      |
| POST   | `/api/editor/projects/{id}/components/`           | Adauga sau actualizeaza componenta|
| DELETE | `/api/editor/projects/{id}/components/delete/`    | Sterge o componenta dupa id       |
| POST   | `/api/editor/projects/{id}/components/reorder/`   | Reordoneaza componentele          |

### Body upsert componenta
```json
{
  "component": {
    "id": "hero-title",
    "type": "text",
    "tag": "h1",
    "content": "Titlu nou",
    "fontSize": "3rem",
    "color": "#0f172a"
  }
}
```

### Body delete componenta
```json
{ "component_id": "hero-title" }
```

### Body reorder
```json
{ "ordered_ids": ["nav-1", "hero-section", "spacer-1", "about-section"] }
```

---

## Export  `/api/export/`

| Metoda | Endpoint                           | Descriere                          |
|--------|------------------------------------|------------------------------------|
| GET    | `/api/export/{id}/?format=zip`     | Descarca ZIP cu HTML + CSS + JS    |
| GET    | `/api/export/{id}/?format=json`    | Returneaza HTML/CSS/JS ca JSON     |

---

## Tipuri de componente

| Tip         | Campuri cheie optionale                                      |
|-------------|--------------------------------------------------------------|
| `navbar`    | logo, links[], sticky, backgroundColor, textColor           |
| `text`      | content, tag (h1-h6/p/span), fontSize, fontWeight, align    |
| `image`     | src, alt, width, borderRadius, link                         |
| `button`    | label, href, backgroundColor, textColor, size, borderRadius |
| `video`     | src, controls, autoplay, loop, muted, poster                |
| `link`      | href, label, target, color, underline                       |
| `container` | children[], direction, gap, padding, justify                |
| `section`   | children[], padding, backgroundColor, minHeight             |
| `divider`   | color, thickness, margin                                    |
| `spacer`    | height                                                      |

`container` si `section` suporta `children[]` recursive.
