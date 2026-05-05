# Module Backend (Laravel API)

## Description
Ce module expose l API REST de la plateforme de revue scientifique.
Il gere l authentification Sanctum, les roles Spatie, les articles, les relectures,
les decisions editoriales, les notifications et la publication publique.

## Fichiers crees (principaux)
- `routes/api.php` : endpoints versionnes `/api/v1/*`.
- `app/Http/Controllers/Api/V1/*` : logique des endpoints.
- `app/Http/Requests/*` : validations des requetes.
- `app/Http/Resources/*` : format uniforme des reponses JSON.
- `app/Services/*` : logique metier (statuts articles, etc.).
- `database/migrations/*` : schema MySQL et index.
- `database/seeders/*` : roles/permissions et donnees de base.

## Installation et configuration
Explication : ces commandes installent les dependances backend et preparent l API.

```powershell
# 1) Ouvrir un terminal dans backend
cd C:\Users\PcTec\Desktop\DevWeb\journal-platform\backend

# 2) Installer les dependances PHP
composer install

# 3) Copier le fichier d environnement
Copy-Item .env.example .env

# 4) Generer la cle applicative
php artisan key:generate

# 5) Lancer les migrations
php artisan migrate

# 6) Injecter les seeders IAM
php artisan db:seed
```

## Runbook IAM (admin/roles)
Explication : procedure minimale pour obtenir un admin fonctionnel dans CE projet.

```powershell
# 1) Preparer schema + IAM
php artisan migrate
php artisan db:seed

# 2) Verifier les routes protegees admin
php artisan route:list | Select-String "api/v1/users"

# 3) Login admin demo
# email: admin@journal.local
# mot de passe: Admin@12345
```

Note : `DatabaseSeeder` injecte `RolePermissionSeeder` systematiquement et `DemoDataSeeder`.

## Variables d environnement essentielles
Verifier dans `.env` :

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=journal_platform
DB_USERNAME=root
DB_PASSWORD=
QUEUE_CONNECTION=database
SESSION_DRIVER=database

# SPA (Next.js ou Vite) : origines autorisees pour les requetes avec cookies (CORS).
# Inclure le meme scheme+host+port que le navigateur (ne pas melanger les hosts).
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Domaines stateful Sanctum (host:port du SPA uniquement, sans scheme).
# Ne pas y mettre le port de l API Laravel (ex. pas :8000) — seulement le front (Next/Vite).
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173

# En local multi-ports, laisser vide evite les cookies bloques entre localhost et 127.0.0.1.
SESSION_DOMAIN=
```

## Demarrage en local
Explication : lancer l API et le worker queue dans deux terminaux separes.

```powershell
# Terminal 1: API Laravel
php artisan serve --host=localhost --port=8000

# Terminal 2: worker queue
php artisan queue:work --sleep=3 --tries=3
```

## Comment tester
1. Verifier les routes users admin:

```powershell
php artisan route:list | Select-String "api/v1/users"
```

2. Tester un endpoint authentifie (exemple):
   - `GET /api/v1/auth/me`
3. Tester les modules metier:
   - articles / versions
   - assignations / reviews
   - decisions
   - notifications
   - publications publiques

## Tests automatises
Explication : cette commande execute la suite de tests backend (Feature + Unit).

```powershell
php artisan test
```

## Depannage courant
- Erreur SQL : verifier MySQL XAMPP actif et valeurs DB dans `.env`.
- Table `user_notifications` introuvable : lancer `php artisan migrate` (migration `ensure_user_notifications_table_exists` ou renommage `notifications` → `user_notifications`).
- Erreur 419 Sanctum :
   1. Utiliser le meme host partout (tout en `localhost`, ne pas melanger).
   2. Appeler `GET /api/v1/sanctum/csrf-cookie` (ou `GET /sanctum/csrf-cookie`) avant les requetes `POST`/`PUT`/`PATCH`/`DELETE` ; le front Axios envoie `X-XSRF-TOKEN` automatiquement si le cookie est present.
   3. Envoyer les requetes avec credentials (`withCredentials: true`).
   4. `CORS_ALLOWED_ORIGINS` doit inclure **exactement** l origine du navigateur (ex. `http://localhost:3000`).
   5. `SANCTUM_STATEFUL_DOMAINS` : uniquement les **fronts** (`localhost:3000`, etc.), pas `localhost:8000`.
   6. `SESSION_DOMAIN` : en local, laisser vide (`SESSION_DOMAIN=`) si vous alternez `localhost` et `127.0.0.1`.
   7. Swagger / Postman : les routes sous session + CSRF exigent le cookie de session **et** l en-tete `X-XSRF-TOKEN` ; preferer le SPA ou appeler d abord `GET .../sanctum/csrf-cookie` avec la meme session.
- Erreur role 403 : verifier les roles Spatie en base et middleware `role.any`.
- Erreur queue : verifier `jobs`/`failed_jobs` migres et worker actif.
