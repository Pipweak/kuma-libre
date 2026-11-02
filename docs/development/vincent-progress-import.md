# Import de la progression historique de Vincent

Cette procédure importe une seule fois [`../../progress-vincent.json`](../../progress-vincent.json) dans la progression Supabase du compte de Vincent.

## Garanties

- les 153 entrées historiques initialisent uniquement la compréhension `japanese_to_meaning` ;
- `red` devient le score `0`, `yellow` le score `1` et un éventuel `green` le score `3` ;
- la production reste absente, donc rouge avec un score implicite de `0` ;
- les compteurs et la dernière révision disponibles sont conservés ;
- aucun événement historique n'est inventé, car le fichier ne contient pas les réponses soumises ;
- une progression distante différente bloque l'import au lieu d'être écrasée ;
- relancer un import déjà appliqué n'effectue aucune écriture.

## Préparation

1. Déployer les migrations Supabase.
2. Créer le compte cible en effectuant une première connexion à Kuma Libre.
3. Dans **Supabase Dashboard → Authentication → Users**, copier l'UUID du compte.
4. À la racine du dépôt, créer un fichier local `.env.progress.local` :

```dotenv
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VINCENT_USER_ID=00000000-0000-4000-8000-000000000000
```

Ce fichier est ignoré par Git. La clé administrative ne doit jamais utiliser un nom `VITE_*`, être copiée dans `.env.local`, Cloudflare Pages ou le frontend.

## Validation locale sans écriture

```bash
npm run progress:vincent:import
```

Résultat attendu :

```text
Progression Vincent résolue : 153 entrées de compréhension (29 rouges, 124 jaunes, 0 vertes).
Aperçu validé. Ajoutez --apply pour écrire dans le projet Supabase configuré.
```

Cette commande ne lit pas les secrets et n'appelle pas Supabase.

## Application distante

Vérifier une dernière fois le projet Supabase ciblé et l'UUID, puis lancer :

```bash
npm run progress:vincent:import -- --apply
```

Le script confirme l'utilisateur, compare les éventuelles lignes existantes puis ajoute uniquement les lignes absentes. Une seconde exécution doit répondre que la progression est déjà intégralement importée.

Après vérification du compte dans l'application, supprimer `.env.progress.local` si la migration ne doit plus être rejouée.
