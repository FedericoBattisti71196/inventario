# Inventario

Scheletro applicazione inventario con **FastAPI**, **MySQL** e **React**.

## Struttura

```
inventario/
├── backend/          # API FastAPI + SQLAlchemy
├── frontend/         # UI React (Vite)
└── README.md
```

## Prerequisiti

- Python 3.11+
- Node.js 18+
- MySQL in esecuzione

## Setup MySQL

1. Crea il database (opzionale se usi già `create_all` di SQLAlchemy):

```bash
mysql -u root -p < backend/sql/schema.sql
```

2. Copia e configura le variabili ambiente:

```bash
cd backend
copy .env.example .env
```

Modifica `DATABASE_URL` in `backend/.env` con utente e password MySQL reali.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- API: http://localhost:8000
- Docs Swagger: http://localhost:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

- UI: http://localhost:5173

## Endpoint principali

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/items` | Elenco articoli |
| GET | `/items/{id}` | Dettaglio |
| POST | `/items` | Crea articolo |
| PUT | `/items/{id}` | Aggiorna |
| DELETE | `/items/{id}` | Elimina |
