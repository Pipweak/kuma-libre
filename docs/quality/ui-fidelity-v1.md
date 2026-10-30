# Fidélité UI et animations — V1

> **Statut :** checklist vivante de la passe visuelle V1.
> **Référence fonctionnelle :** [`../../mockups/v1/flows.html`](../../mockups/v1/flows.html).

Ce contrôle vérifie chaque écran de l’application contre le storyboard fonctionnel, sans transformer les planches historiques `index.html` en source de vérité. Il couvre le rendu, les états, le responsive, le clavier, l’accessibilité et le mouvement.

## Critères communs

- mobile en priorité à `390 × 844` ou largeur équivalente ;
- contrôle desktop à `1440 × 900` ;
- aucun logo ou asset de marque tronqué ; le mot-symbole V2 utilise un canevas transparent resserré pour que son alignement visuel corresponde à la maquette ;
- français, anglais et espagnol sans débordement bloquant ;
- cibles tactiles d’au moins 44 px et focus clavier visible ;
- durée principale de `250 ms`, micro-interactions de `150 ms`, sorties de `180 ms` ;
- animations longues limitées aux états continus justifiés ;
- aucune animation nécessaire à la compréhension ou bloquant une action ;
- `prefers-reduced-motion` neutralise le mouvement non essentiel ;
- aucune transition ne diminue temporairement le contraste d’un texte ou d’un CTA ;
- les pages secondaires protégées présentent une seule flèche de retour contextuelle dans le header, avec le profil maintenu à droite ;
- pas de régression axe, de saut de mise en page visible ou de ralentissement d’interaction.

## Lot 1/3 — fondations, public et authentification

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Chargement initial | toutes | shell visible avant React, logo empilé complet, message FR/EN/ES annoncé, boucle légère, réduction de mouvement | Validé |
| Accueil public | `/` | mot-symbole V2 resserré et aligné sans troncature, profil générique, hero, exemple réel, CTA, FR/EN/ES, mobile/desktop | Validé |
| Explication | `/#how-it-works` | trois étapes lisibles, ancre clavier, cartes responsives | Validé |
| Choix de connexion | `/auth` | retour, Google, email, légal, focus visible | Validé |
| Adresse email | `/auth` | transition depuis les méthodes, champ étiqueté, envoi et erreur | Validé |
| Email envoyé | `/auth` | adresse confirmée, renvoi, changement d’adresse | Validé |
| Callback | `/auth/callback` | attente annoncée, animation réduite, erreur et nouvelle tentative | Validé |

## Lot 2/3 — navigation et consultation

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Accueil connecté | `/app` | révision rapide réelle, trois premières leçons, CTA vers le parcours complet | Validé |
| Panneau de profil | application | overlay, glissement depuis la droite, fermeture, piège de focus, `Escape`, réduction de mouvement | Validé |
| Liste des leçons | `/app/lessons` | révision rapide compacte, progression, cartes, mobile/desktop | Validé |
| Détail d’une leçon | `/app/lessons/:lessonId` | vocabulaire réel, C/P, CTA préconfiguré, listes responsives | Validé |
| Progression | `/app/progress` | global, directions, leçons, libellés non fondés uniquement sur la couleur | Validé |
| Langue | `/app/settings/language` | FR/EN/ES avec drapeaux et sélection explicite, mise à jour immédiate | Validé |
| Compte et déconnexion | `/app/account` | initiale, identité, confirmation animée, erreurs | Validé |
| Page inconnue | `*` | retour sûr public ou connecté | Validé |

## Lot 3/3 — quiz et voix

| Écran ou état | Route | Contrôles principaux | Statut |
| --- | --- | --- | --- |
| Configuration | `/app/quiz/configure` | retour contextuel dans le header, leçons, drapeau actif, statuts, ordre, nombre de questions | Prêt à valider |
| Question compréhension | `/app/quiz` | progression, japonais, écoute, input, micro, clavier | Prêt à valider |
| Question production | `/app/quiz` | signification locale, réponse rōmaji/kana/kanji | Prêt à valider |
| Correction correcte | `/app/quiz` | apparition stable, icône, texte, progression, formes acceptées | Prêt à valider |
| Correction incorrecte | `/app/quiz` | réponse donnée, solution, mouvement discret, annonce | Prêt à valider |
| Sauvegarde échouée | `/app/quiz` | même tentative, réessai idempotent, aucun faux succès | Prêt à valider |
| Dictée | `/app/quiz` | écoute, durée, onde, arrêt, transcription, erreur, clavier | Prêt à valider |
| Sortie de passe | `/app/quiz` | modal, overlay, focus, reprise ou sortie | Prêt à valider |
| Bilan | `/app/quiz/result` | scores, actions suivantes, animation unique | Prêt à valider |

Un statut passe à **Validé** uniquement après les contrôles automatiques applicables et la validation visuelle utilisateur du lot concerné.
