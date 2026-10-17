# Kuma Libre — Design system exploratoire

Ce dossier transforme les références visuelles générées en fondations réutilisables pour les maquettes, puis pour la future application.

## Source de vérité

- `styles/tokens.css` contient la palette primitive et les rôles sémantiques, la typographie, les espacements, les rayons et les ombres.
- `styles/tokens.scss` expose des alias SCSS vers les variables CSS, sans recopier les valeurs hexadécimales.
- `styles/brand.css` fournit les variantes réutilisables de la marque, dont les deux compositions raster validées pour les maquettes.
- `assets/kuma-bear-wink.png` est la référence raster provisoire de la mascotte avec son clin d’œil.
- `assets/kuma-wordmark.png` contient le mot-symbole horizontal sans la mascotte.
- `assets/kuma-logo-stacked.png` contient la composition verticale utilisée pendant le chargement.

## Direction retenue

- **Typographie** : retour à la pile sobre d’origine basée sur Inter et les fontes système.
- **Japonais** : Yu Gothic UI, Hiragino Sans ou Noto Sans JP selon la plateforme.
- **Action principale** : rouge vermillon.
- **Fond** : crème chaud, avec des surfaces presque blanches.
- **Mascotte** : brun caramel, museau crème, montagne et soleil rouge.

La fonte du visuel généré n’est pas reprise pour l’instant. Le choix typographique final reste ouvert.

Pour afficher directement les compositions générées :

```html
<span class="kl-brand-art kl-brand-art--wordmark" role="img" aria-label="Kuma Libre"></span>
<span class="kl-brand-art kl-brand-art--stacked" role="img" aria-label="Kuma Libre"></span>
```

La taille et le recadrage restent définis par le composant qui les utilise.

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

