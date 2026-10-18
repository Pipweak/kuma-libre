# Kuma Libre — Design system exploratoire

Ce dossier transforme les références visuelles générées en fondations réutilisables pour les maquettes, puis pour la future application.

## Source de vérité

- `styles/tokens.css` contient la palette primitive et les rôles sémantiques, la typographie, les espacements, les rayons et les ombres.
- `styles/tokens.scss` expose des alias SCSS vers les variables CSS, sans recopier les valeurs hexadécimales.
- `styles/brand.css` fournit les variantes réutilisables de la marque.
- `assets/kuma-bear-wink.png` est la référence raster transparente de la mascotte avec son clin d’œil.
- `assets/kuma-wordmark.png` contient le mot-symbole transparent sans la mascotte.
- `assets/kuma-logo-horizontal.png` contient la composition horizontale transparente avec la mascotte.
- `assets/kuma-logo-stacked.png` contient la composition verticale transparente utilisée pendant le chargement.

## Direction retenue

- **Typographie** : retour à la pile sobre d’origine basée sur Inter et les fontes système.
- **Japonais** : Yu Gothic UI, Hiragino Sans ou Noto Sans JP selon la plateforme.
- **Action principale** : rouge vermillon.
- **Fond** : crème chaud, avec des surfaces presque blanches.
- **Mascotte** : brun caramel, museau crème, montagne et soleil rouge.
- **Styles de l'application** : Tailwind CSS pour la majorité de la mise en page et des états simples ; modules SCSS colocalisés pour les styles spécifiques, les animations et l'imbrication contrôlée.

La fonte du visuel généré n’est pas reprise pour l’instant. Le choix typographique final reste ouvert.

Pour afficher directement les compositions générées :

```html
<span class="kl-brand-art kl-brand-art--wordmark" role="img" aria-label="Kuma Libre"></span>
<span class="kl-brand-art kl-brand-art--horizontal" role="img" aria-label="Kuma Libre"></span>
<span class="kl-brand-art kl-brand-art--stacked" role="img" aria-label="Kuma Libre"></span>
```

La taille et le recadrage restent définis par le composant qui les utilise.

## Cible React

Les valeurs du design system restent centralisées dans les variables CSS sémantiques. Tailwind référence ces mêmes tokens au lieu de dupliquer la palette. Un composant nécessitant du SCSS utilise un fichier `Component.module.scss` et peut imbriquer ses variantes :

```scss
.answer {
  &.correct {
    border-color: var(--kl-color-success);
  }

  .icon {
    margin-inline-end: var(--kl-space-2);
  }
}
```

L'imbrication reste courte et locale au composant. Aucun nouveau code métier ne dépend d'un grand fichier de styles global.

## Utilisation

```html
<link rel="stylesheet" href="../design-system/styles/tokens.css" />
<link rel="stylesheet" href="../design-system/styles/brand.css" />

<a class="kl-brand" href="#">
  <span class="kl-brand__bear" aria-hidden="true"></span>
  <span class="kl-brand__wordmark">
    <span class="kl-brand__wordmark-kuma">Kuma</span>
    <span class="kl-brand__wordmark-libre">Libre</span>
  </span>
</a>
```

La mascotte reste volontairement en PNG pour cette étape. Une éventuelle vectorisation et l’animation des yeux sont repoussées jusqu’à validation du dessin définitif.

