# Fidélité UI et animations — V1

> **Statut :** checklist vivante de la passe visuelle V1.
> **Référence fonctionnelle :** [`../../mockups/v1/flows.html`](../../mockups/v1/flows.html).

Ce contrôle vérifie chaque écran de l’application contre le storyboard fonctionnel, sans transformer les planches historiques `index.html` en source de vérité. Il couvre le rendu, les états, le responsive, le clavier, l’accessibilité et le mouvement.

## Critères communs

- mobile en priorité à `390 × 844` ou largeur équivalente ;
- contrôle desktop à `1440 × 900` ;
- aucun logo ou asset de marque recadré ;
- français, anglais et espagnol sans débordement bloquant ;
- cibles tactiles d’au moins 44 px et focus clavier visible ;
- durée principale de `250 ms`, micro-interactions de `150 ms`, sorties de `180 ms` ;
- animations longues limitées aux états continus justifiés ;
- aucune animation nécessaire à la compréhension ou bloquant une action ;
- `prefers-reduced-motion` neutralise le mouvement non essentiel ;
- pas de régression axe, de saut de mise en page visible ou de ralentissement d’interaction.

## Lot 1/3 — fondations, public et authentification

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Chargement initial | toutes | logo empilé complet, message annoncé, boucle légère, réduction de mouvement | Prêt à valider |
| Accueil public | `/` | mot-symbole seul, profil générique, hero, exemple réel, CTA, FR/EN/ES, mobile/desktop | Prêt à valider |
| Explication | `/#how-it-works` | trois étapes lisibles, ancre clavier, cartes responsives | Prêt à valider |
| Choix de connexion | `/auth` | retour, Google, email, légal, focus visible | Prêt à valider |
| Adresse email | `/auth` | transition depuis les méthodes, champ étiqueté, envoi et erreur | Prêt à valider |
| Email envoyé | `/auth` | adresse confirmée, renvoi, changement d’adresse | Prêt à valider |
| Callback | `/auth/callback` | attente annoncée, animation réduite, erreur et nouvelle tentative | Prêt à valider |

## Lot 2/3 — navigation et consultation

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Panneau de profil | application | overlay, glissement, fermeture, piège de focus, `Escape` | À faire |
| Liste des leçons | `/app/lessons` | révision rapide, progression, cartes, mobile/desktop | À faire |
| Détail d’une leçon | `/app/lessons/:lessonId` | vocabulaire réel, C/P, CTA préconfiguré, listes responsives | À faire |
| Progression | `/app/progress` | global, directions, leçons, libellés non fondés uniquement sur la couleur | À faire |
| Langue | `/app/settings/language` | FR/EN/ES, état sélectionné, mise à jour immédiate | À faire |
| Compte et déconnexion | `/app/account` | initiale, identité, confirmation animée, erreurs | À faire |
| Page inconnue | `*` | retour sûr public ou connecté | À faire |

## Lot 3/3 — quiz et voix

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Configuration | `/app/quiz/configure` | leçons, drapeau actif, statuts, ordre, nombre de questions | À faire |
| Question compréhension | `/app/quiz` | progression, japonais, écoute, input, micro, clavier | À faire |
| Question production | `/app/quiz` | signification locale, réponse rōmaji/kana/kanji | À faire |
| Correction correcte | `/app/quiz` | apparition stable, icône, texte, progression, formes acceptées | À faire |
| Correction incorrecte | `/app/quiz` | réponse donnée, solution, mouvement discret, annonce | À faire |
| Sauvegarde échouée | `/app/quiz` | même tentative, réessai idempotent, aucun faux succès | À faire |
| Dictée | `/app/quiz` | écoute, durée, onde, arrêt, transcription, erreur, clavier | À faire |
| Sortie de passe | `/app/quiz` | modal, overlay, focus, reprise ou sortie | À faire |
| Bilan | `/app/quiz/result` | scores, actions suivantes, animation unique | À faire |

Un statut passe à **Validé** uniquement après les contrôles automatiques applicables et la validation visuelle utilisateur du lot concerné.
