# Revue UX des parcours V1

Ce document consigne les remarques faites pendant la lecture de `flows.html`, afin de distinguer les corrections validées des sujets encore ouverts.

## Passe du 17 octobre 2026 — première partie

### Intégré

- **Chargement initial** : utiliser directement le logo vertical généré avec la tête de Kuma et le mot-symbole en dessous.
- **Headers de l’application** : utiliser le mot-symbole généré `Kuma Libre`, sans petite tête d’ours supplémentaire.
- **Visiteur non connecté** : remplacer le libellé `Connexion` du header par une icône de profil générique.
- **Retours** : remplacer la flèche typographique par une vraie icône vectorielle cohérente.
- **Question audio** : remplacer la bulle ambiguë par un contrôle explicite avec une icône de haut-parleur et le libellé `Écouter`.

Les icônes simples sont dessinées en SVG inline. Une dépendance comme Font Awesome n’est pas nécessaire pour ces trois pictogrammes et pourra être réévaluée si l’application acquiert une iconographie beaucoup plus large.

### À redéfinir

- **Statuts dans les listes de leçons** : les petits indicateurs vert, jaune et rouge ne sont pas satisfaisants. Ne pas figer ce composant avant d’avoir comparé plusieurs solutions : barre de progression, anneau, état textuel, icône ou combinaison accessible.
- **Exemple de vocabulaire sur l’accueil public** : l’exemple `食べます / manger · to eat` est actuellement un contenu statique de démonstration, pas un mot aléatoire ni un mini-quiz. Confirmer plus tard s’il doit rester statique, tourner automatiquement ou disparaître.

### Conservé provisoirement

- texte et barre du chargement ;
- écrans Google, callback et email ;
- structure générale de l’accueil connecté et des parcours de quiz.

