# InMoshPit

Concert streaming platform: watch live concerts and festivals, then catch up
with the recordings. Available in German and English.

## Features

- Live streams with countdown, status updates and HLS playback
- Recordings archive with likes and comments
- Events (concerts, festivals) with line-up and stages, artists and bands
- Registration and JWT login
- Light and dark theme, DE/EN language switcher

## Stack

- **Backend:** Python, Django, Django REST Framework, SQLite, JWT
- **Frontend:** Vue 3, TypeScript, Vite, Pinia, vue-i18n
- **Video:** HLS via hls.js

## Getting started

Requires Python 3.13+ and Node.js 20.19+ (or 22.12+).

**Backend** (http://127.0.0.1:8002)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo        # demo events, streams and a video
python manage.py runserver 8002
```

**Frontend** (http://localhost:5173)

```powershell
cd frontend
npm install
echo VITE_API_BASE_URL=http://127.0.0.1:8002/api/v1 > .env   # not committed
npm run dev
```

Create an admin user with `python manage.py createsuperuser` to manage
content at `/admin/`.

## Tests

```powershell
cd backend ; python -m pytest
cd frontend ; npm run test:run
```

## Status

Early MVP. Not yet included: ingest for real live streams (RTMP to HLS),
FFmpeg processing of uploaded recordings, live chat, and a content management
UI beyond the Django admin. Settings in `backend/config/settings.py` are for
development only (`DEBUG`, `SECRET_KEY`).
