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

Note : `DatabaseSeeder` injecte `RolePermissionSeeder` systematiquement et `DemoDataSeeder` en environnements local/development/testing.

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
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

## Demarrage en local
Explication : lancer l API et le worker queue dans deux terminaux separes.

```powershell
# Terminal 1: API Laravel
php artisan serve --host=127.0.0.1 --port=8000

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
- Erreur 419 Sanctum :
   1. Utiliser le meme host partout (tout en `localhost` ou tout en `127.0.0.1`, ne pas melanger).
   2. Appeler `GET /sanctum/csrf-cookie` avant `POST /api/v1/auth/login`.
   3. Envoyer les requetes avec credentials (`withCredentials: true`).
   4. Verifier `SANCTUM_STATEFUL_DOMAINS` et `CORS_ALLOWED_ORIGINS` dans `.env`.
- Erreur role 403 : verifier les roles Spatie en base et middleware `role.any`.
- Erreur queue : verifier `jobs`/`failed_jobs` migres et worker actif.
