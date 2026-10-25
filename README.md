# Inventario

Applicazione inventario con **FastAPI**, **MariaDB/MySQL** e **React**.

## Pagine

| Route | Descrizione |
|-------|-------------|
| `/login` | Accesso |
| `/` | Inventario (ricerca + lista cliccabile) |
| `/items/new` | Nuovo articolo (insert) |
| `/items/:id` | Dettaglio (modifica / elimina) |

## Struttura

```
inventario/
├── backend/          # API FastAPI + SQLAlchemy
├── frontend/         # UI React (Vite)
└── README.md
```

## Setup backend

1. Configura `backend/.env` (vedi `.env.example`).
2. Installa e avvia:

```bash
cd backend
python -m venv .venv
# Linux: source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

All’avvio vengono create le tabelle se mancano. Gli utenti si creano solo da DB (`S_Users` + `D_Roles`).

**Ruoli** (`D_Roles.Code`): `1` = Amministratore (scrittura), `2` = Solo visualizzazione.

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## Setup frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Opzionale: crea `frontend/.env` con:

```env
VITE_API_URL=http://15.235.245.150:8000
```

(usa l’URL reale dell’API)

## Endpoint

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| POST | `/auth/login` | no | Login (form username/password) |
| GET | `/auth/me` | sì | Utente corrente |
| GET | `/items` | sì | Elenco |
| GET | `/items/{id}` | sì | Dettaglio |
| POST | `/items` | sì | Crea (`multipart`: name, quantity, year, image) |
| PUT | `/items/{id}` | sì | Aggiorna (`multipart`) |
| DELETE | `/items/{id}` | sì | Elimina |
| GET | `/uploads/...` | no | File immagine salvati sul server |

Tabelle DB attese (gestite a parte): `D_Roles` (`Code`, `Description`), `S_Users` (`Username`, `HashedPassword`, `RoleID`), `T_Items` (`Name`, `Quantity`, `Year`, `ImagePath`, `CreatedAt`).
