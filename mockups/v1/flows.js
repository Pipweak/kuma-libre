const MAP_WIDTH = 2060;
const MAP_HEIGHT = 1200;
const NODE_WIDTH = 194;
const NODE_HEIGHT = 74;

const routeNodes = [
  { id: "boot", label: "Chargement initial", meta: "session + application", x: 40, y: 470, type: "state", lane: "launch-anonymous" },
  { id: "gate", label: "Session connue ?", meta: "décision automatique", x: 280, y: 470, type: "decision", lane: "launch-connected" },
  { id: "landing", label: "Accueil public", meta: "présentation + connexion", x: 540, y: 120, type: "public", lane: "launch-anonymous" },
  { id: "login", label: "Choix de connexion", meta: "Google ou email", x: 780, y: 120, type: "public", lane: "auth-google" },
  { id: "google", label: "Google OAuth", meta: "fournisseur externe", x: 1040, y: 45, type: "public", lane: "auth-google" },
  { id: "email", label: "Adresse email", meta: "magic link ou OTP", x: 1040, y: 180, type: "public", lane: "auth-email", open: true },
  { id: "inbox", label: "Vérifie tes emails", meta: "attente du lien", x: 1280, y: 180, type: "state", lane: "auth-email" },
  { id: "callback", label: "Retour d’authentification", meta: "création de session", x: 1520, y: 110, type: "state", lane: "auth-google" },
  { id: "auth-error", label: "Erreur de connexion", meta: "message + réessayer", x: 1280, y: 310, type: "state", lane: "auth-email" },
  { id: "home-after-auth", label: "Accueil connecté", meta: "destination après login", x: 1800, y: 110, type: "app", lane: "quick-review" },
  { id: "protected", label: "Lien protégé", meta: "leçon, quiz ou progrès", x: 540, y: 295, type: "state", lane: "protected-link" },
  { id: "home", label: "Accueil connecté", meta: "point de départ principal", x: 540, y: 550, type: "app", lane: "launch-connected" },
  { id: "resume", label: "Reprendre la passe", meta: "session interrompue", x: 800, y: 365, type: "quiz", lane: "resume-session", open: true },
  { id: "quick", label: "Révision rapide", meta: "10 mots proposés", x: 800, y: 480, type: "quiz", lane: "quick-review", open: true },
  { id: "config", label: "Configurer le quiz", meta: "leçons, sens, statuts", x: 800, y: 600, type: "app", lane: "custom-review" },
  { id: "lessons", label: "Parcours de leçons", meta: "groupes + progression", x: 800, y: 720, type: "app", lane: "lesson-review" },
  { id: "menu", label: "Menu secondaire", meta: "navigation globale", x: 800, y: 870, type: "state", lane: "progress-path" },
  { id: "quiz", label: "Question du quiz", meta: "réponse puis validation", x: 1070, y: 480, type: "quiz", lane: "quick-review" },
  { id: "empty", label: "Aucune question", meta: "modifier la sélection", x: 1070, y: 600, type: "state", lane: "custom-review" },
  { id: "lesson-detail", label: "Détail d’une leçon", meta: "vocabulaire + progrès", x: 1070, y: 720, type: "app", lane: "lesson-review" },
  { id: "progress", label: "Progression", meta: "global + par leçon", x: 1070, y: 810, type: "app", lane: "progress-path" },
  { id: "language", label: "Langue", meta: "français, anglais ou espagnol", x: 1070, y: 910, type: "app", lane: "language-settings" },
  { id: "account", label: "Compte", meta: "profil + déconnexion", x: 1070, y: 1010, type: "app", lane: "account-logout" },
  { id: "correct", label: "Réponse correcte", meta: "solution + progression", x: 1340, y: 400, type: "state", lane: "quick-review" },
  { id: "incorrect", label: "Réponse incorrecte", meta: "solution attendue", x: 1340, y: 520, type: "state", lane: "quick-review" },
  { id: "exit", label: "Quitter la passe ?", meta: "confirmation", x: 1340, y: 640, type: "state", lane: "resume-session" },
  { id: "lesson-config", label: "Configuration préremplie", meta: "leçon déjà sélectionnée", x: 1340, y: 745, type: "app", lane: "lesson-review" },
  { id: "logout", label: "Confirmer la déconnexion", meta: "fermeture de session", x: 1340, y: 1010, type: "state", lane: "account-logout" },
  { id: "complete", label: "Fin de passe", meta: "bilan + prochaine action", x: 1590, y: 460, type: "quiz", lane: "quick-review" },
  { id: "lesson-quiz", label: "Quiz de la leçon", meta: "moteur de quiz commun", x: 1590, y: 745, type: "quiz", lane: "lesson-review" },
  { id: "public-return", label: "Retour accueil public", meta: "utilisateur déconnecté", x: 1590, y: 1010, type: "public", lane: "account-logout" },
  { id: "home-again", label: "Accueil / nouvelle passe", meta: "sortie du quiz", x: 1840, y: 460, type: "app", lane: "quick-review" },
  { id: "new-config", label: "Nouvelle configuration", meta: "autre passe", x: 1840, y: 565, type: "app", lane: "custom-review" },
  { id: "not-found", label: "Page introuvable", meta: "route inconnue", x: 540, y: 1110, type: "state", lane: "not-found" },
  { id: "safe-return", label: "Retour sûr", meta: "public ou connecté", x: 800, y: 1110, type: "app", lane: "not-found" }
];

const routeEdges = [
  { from: "boot", to: "gate" },
  { from: "gate", to: "landing", label: "non" },
  { from: "gate", to: "home", label: "oui" },
  { from: "landing", to: "login", label: "se connecter" },
  { from: "login", to: "google", label: "Google" },
  { from: "login", to: "email", label: "email" },
  { from: "google", to: "callback" },
  { from: "email", to: "inbox" },
  { from: "inbox", to: "callback" },
  { from: "email", to: "auth-error", label: "erreur" },
  { from: "callback", to: "home-after-auth" },
  { from: "protected", to: "login", label: "session absente" },
  { from: "home", to: "resume", label: "reprendre" },
  { from: "home", to: "quick", label: "rapide" },
  { from: "home", to: "config", label: "configurer" },
  { from: "home", to: "lessons", label: "leçons" },
  { from: "home", to: "menu", label: "menu" },
  { from: "resume", to: "quiz" },
  { from: "quick", to: "quiz" },
  { from: "config", to: "quiz", label: "questions trouvées" },
  { from: "config", to: "empty", label: "0 question" },
  { from: "quiz", to: "correct", label: "correct" },
  { from: "quiz", to: "incorrect", label: "incorrect" },
  { from: "quiz", to: "exit", label: "quitter" },
  { from: "correct", to: "complete", label: "suivante / fin" },
  { from: "incorrect", to: "complete", label: "suivante / fin" },
  { from: "complete", to: "home-again" },
  { from: "complete", to: "new-config", label: "nouvelle passe" },
  { from: "lessons", to: "lesson-detail" },
  { from: "lesson-detail", to: "lesson-config", label: "réviser" },
  { from: "lesson-config", to: "lesson-quiz" },
  { from: "lesson-quiz", to: "complete" },
  { from: "menu", to: "progress" },
  { from: "menu", to: "language" },
  { from: "menu", to: "account" },
  { from: "progress", to: "lesson-detail", label: "ouvrir une leçon" },
  { from: "account", to: "logout" },
  { from: "logout", to: "public-return" },
  { from: "not-found", to: "safe-return" }
];

const screenTemplates = {
  loader: () => `
    <div class="product-screen loader-view">
      <div class="loader-logo kl-brand-art kl-brand-art--stacked" role="img" aria-label="Kuma Libre"></div>
      <p>Préparation de ta révision…</p>
      <i class="loading-line"><u></u></i>
      <small>Mascotte provisoire · animation à étudier plus tard</small>
    </div>`,

  landing: () => `
    <div class="product-screen public-view">
      ${miniBrand("Connexion")}
      <div class="public-hero">
        <span class="tiny-eyebrow">VOCABULAIRE JAPONAIS</span>
        <h4>Révise un peu.<br />Retiens vraiment.</h4>
        <p>Des quiz simples pour travailler chaque mot dans les deux sens.</p>
        <div class="sample-word"><small>日本語</small><strong>食べます</strong><span>manger · to eat · comer</span></div>
      </div>
      <div class="screen-bottom">
        <button class="mini-primary">Se connecter</button>
        <button class="mini-link">Comment ça marche ?</button>
      </div>
    </div>`,

  login: () => `
    <div class="product-screen auth-view">
      ${miniHeader("Connexion", "←")}
      <div class="auth-copy"><span class="tiny-eyebrow">BIENVENUE</span><h4>Retrouve ta progression.</h4><p>Choisis une méthode de connexion.</p></div>
      <div class="auth-actions">
        <button class="provider-button"><b>G</b> Continuer avec Google</button>
        <div class="or"><span></span><small>ou</small><span></span></div>
        <button class="provider-button"><b>@</b> Continuer avec un email</button>
      </div>
      <p class="legal-copy">En continuant, tu acceptes les conditions et la politique de confidentialité.</p>
    </div>`,

  google: () => `
    <div class="product-screen provider-view">
      <div class="provider-window">
        <div class="provider-logo">G</div>
        <h4>Se connecter avec Google</h4>
        <p>Choisis le compte à utiliser avec Kuma Libre.</p>
        <div class="provider-account"><i>V</i><span><strong>Vincent</strong><small>vincent@example.com</small></span></div>
        <button class="provider-secondary">Utiliser un autre compte</button>
      </div>
      <small>Étape gérée par Google</small>
    </div>`,

  email: () => `
    <div class="product-screen auth-view">
      ${miniHeader("Avec un email", "←")}
      <div class="auth-copy"><span class="tiny-eyebrow">CONNEXION SANS MOT DE PASSE</span><h4>Quelle est ton adresse&nbsp;?</h4><p>Nous t’enverrons un lien de connexion sécurisé.</p></div>
      <label class="mini-field"><span>Adresse email</span><input type="text" value="vincent@example.com" readonly /></label>
      <button class="mini-primary">Envoyer le lien</button>
      <button class="mini-link">Utiliser Google</button>
    </div>`,

  authError: () => `
    <div class="product-screen auth-view">
      ${miniHeader("Avec un email", "←")}
      <div class="auth-copy"><span class="tiny-eyebrow">CONNEXION</span><h4>Réessaie avec ton adresse.</h4><p>Le lien n’a pas pu être envoyé.</p></div>
      <div class="mini-alert"><strong>Une erreur est survenue.</strong><span>Vérifie ta connexion puis réessaie.</span></div>
      <label class="mini-field"><span>Adresse email</span><input type="text" value="vincent@example.com" readonly /></label>
      <button class="mini-primary">Réessayer</button>
      <button class="mini-link">Changer de méthode</button>
    </div>`,

  inbox: () => `
    <div class="product-screen centered-view">
      <span class="round-icon">✉</span>
      <span class="tiny-eyebrow">EMAIL ENVOYÉ</span>
      <h4>Vérifie ta boîte mail.</h4>
      <p>Un lien vient d’être envoyé à <strong>vincent@example.com</strong>.</p>
      <button class="mini-secondary">Renvoyer le lien</button>
      <button class="mini-link">Changer d’adresse</button>
    </div>`,

  callback: () => `
    <div class="product-screen centered-view">
      <span class="callback-mark"><i></i></span>
      <h4>Connexion en cours…</h4>
      <p>Nous préparons ta progression et tes préférences.</p>
      <i class="loading-line"><u></u></i>
    </div>`,

  home: () => `
    <div class="product-screen app-view home-view">
      ${miniBrand("Profil")}
      <div class="welcome"><span class="tiny-eyebrow">BON RETOUR VINCENT</span><h4>Qu’est-ce qu’on révise&nbsp;?</h4></div>
      <div class="quick-card">
        <div><small>RÉVISION RAPIDE</small><strong>10 mots à travailler</strong><span>Comprendre · non maîtrisés et à revoir</span></div>
        <button class="mini-primary">Commencer</button>
        <button class="mini-link">Configurer</button>
      </div>
      <div class="section-row"><strong>Leçons</strong><button>Voir tout</button></div>
      <div class="lesson-preview">
        ${lessonRow("01", "44 entrées", "75 %")}
        ${lessonRow("02", "46 entrées", "50 %")}
        ${lessonRow("03", "49 entrées", "30 %")}
      </div>
    </div>`,

  homeLessons: () => `
    <div class="product-screen app-view home-view">
      ${miniBrand("Profil")}
      <div class="compact-quick"><span><small>Révision rapide</small><strong>10 mots à travailler</strong></span><button>Commencer</button></div>
      <div class="section-row"><strong>Ton parcours</strong><span>18 leçons dans le corpus</span></div>
      <div class="lesson-group">
        ${lessonRow("01", "44 entrées", "75 %")}
        ${lessonRow("02", "46 entrées", "50 %")}
        ${lessonRow("03", "49 entrées", "30 %")}
        ${lessonRow("04", "60 entrées", "16 %")}
      </div>
    </div>`,

  config: (lessonMode = false) => `
    <div class="product-screen app-view config-view">
      ${miniHeader(lessonMode ? "Réviser la leçon 06" : "Configurer", "←")}
      <div class="config-scroll">
        <div class="mini-section"><label>Leçons</label><div class="lesson-pills"><b class="selected">${lessonMode ? "06" : "01"}</b>${lessonMode ? "" : "<b class='selected'>02</b><b class='selected'>03</b><b>04</b><b>+46</b>"}</div></div>
        ${lessonMode ? "<div class='context-note'><strong>Leçon 06 présélectionnée</strong><span>Tu peux encore modifier le périmètre.</span></div>" : ""}
        <div class="mini-section"><label>Sens du quiz</label><div class="direction-options"><button class="selected" aria-pressed="true" aria-label="Comprendre : japonais vers français, anglais ou espagnol"><small>Comprendre</small><span>${languageFlag("ja")}<i>→</i><em>${languageFlag("fr")}${languageFlag("en")}${languageFlag("es")}</em></span></button><button aria-pressed="false" aria-label="Produire : français, anglais ou espagnol vers japonais"><small>Produire</small><span><em>${languageFlag("fr")}${languageFlag("en")}${languageFlag("es")}</em><i>→</i>${languageFlag("ja")}</span></button></div></div>
        <div class="mini-section"><label>Mots à inclure</label><div class="status-options"><label><input type="checkbox" checked /><span class="mock-checkbox">✓</span><b><i class="red"></i>Non maîtrisés</b></label><label><input type="checkbox" checked /><span class="mock-checkbox">✓</span><b><i class="yellow"></i>À revoir</b></label><label><input type="checkbox" /><span class="mock-checkbox"></span><b><i class="green"></i>Maîtrisés</b></label></div></div>
        <div class="mini-section"><label>Ordre</label><div class="mini-segment"><b>Aléatoire</b><span>Dans l’ordre</span></div></div>
      </div>
      <div class="config-action"><span><strong>${lessonMode ? "55" : "84"}</strong> questions</span><button class="mini-primary">Commencer</button></div>
    </div>`,

  emptyConfig: () => `
    <div class="product-screen app-view config-view">
      ${miniHeader("Configurer", "←")}
      <div class="empty-state"><span class="round-icon">0</span><h4>Aucun mot ne correspond.</h4><p>Essaie d’inclure les mots « À revoir » ou de sélectionner une autre leçon.</p><button class="mini-secondary">Modifier les filtres</button></div>
      <div class="config-action disabled"><span><strong>0</strong> question</span><button>Commencer</button></div>
    </div>`,

  quiz: () => `
    <div class="product-screen app-view quiz-view">
      <div class="quiz-top"><button>×</button><span><small>12 / 84</small><i><u style="width: 14%"></u></i></span><button class="profile-trigger" aria-label="Ouvrir le menu du profil">${avatarMark()}</button></div>
      <div class="quiz-tags"><span>Leçon 06</span><span>Comprendre</span></div>
      <div class="word-question"><button class="mini-audio-button" aria-label="Écouter le mot japonais">${uiIcon("volume")}<span>Écouter</span></button><strong lang="ja">食べます</strong><small lang="ja">たべます</small></div>
      <div class="answer-box"><label>Ta réponse</label><div><input placeholder="FR, EN ou ES" readonly /><button>●</button></div><button class="mini-primary">Valider</button><button class="mini-link">Je ne sais pas</button></div>
    </div>`,

  correct: () => `
    <div class="product-screen app-view quiz-view quiz-feedback">
      <div class="quiz-top"><button>×</button><span><small>12 / 84</small><i><u style="width: 14%"></u></i></span><b></b></div>
      <div class="compact-question"><strong lang="ja">食べます</strong><small lang="ja">たべます</small></div>
      <div class="answer-box"><label>Ta réponse</label><div class="answer-correct"><input value="manger" readonly /><b>✓</b></div></div>
      <div class="result-card result-card--correct"><header><b>✓</b><span><strong>Bonne réponse</strong><small>Ce mot passe à « À revoir ».</small></span></header><dl><div><dt>Significations</dt><dd>manger · to eat · comer</dd></div><div><dt>Formes</dt><dd>食べます · たべます</dd></div></dl></div>
      <button class="mini-primary bottom-button">Question suivante</button>
    </div>`,

  incorrect: () => `
    <div class="product-screen app-view quiz-view quiz-feedback">
      <div class="quiz-top"><button>×</button><span><small>12 / 84</small><i><u style="width: 14%"></u></i></span><b></b></div>
      <div class="compact-question"><strong lang="ja">食べます</strong><small lang="ja">たべます</small></div>
      <div class="answer-box"><label>Ta réponse</label><div class="answer-incorrect"><input value="boire" readonly /><b>×</b></div></div>
      <div class="result-card result-card--incorrect"><header><b>×</b><span><strong>À retravailler</strong><small>Ce mot reste non maîtrisé.</small></span></header><dl><div><dt>Réponse attendue</dt><dd>manger · to eat · comer</dd></div><div><dt>Formes</dt><dd>食べます · たべます</dd></div></dl></div>
      <button class="mini-primary bottom-button">Question suivante</button>
    </div>`,

  complete: () => `
    <div class="product-screen app-view complete-view">
      ${miniHeader("Passe terminée", "")}
      <div class="complete-hero"><span>✓</span><small>10 MOTS</small><h4>Bien joué.</h4><p>Les erreurs reviendront dans une prochaine passe.</p></div>
      <div class="mini-stats"><div><strong>10</strong><span>vus</span></div><div><strong>7</strong><span>corrects</span></div><div><strong>3</strong><span>à revoir</span></div></div>
      <div class="progress-gain"><span>Compréhension japonaise</span><i><u style="width: 68%"></u></i><b>68 % <em>+ 2 %</em></b></div>
      <div class="screen-bottom"><button class="mini-primary">Nouvelle passe</button><button class="mini-secondary">Retour à l’accueil</button></div>
    </div>`,

  lesson: () => `
    <div class="product-screen app-view lesson-view">
      ${miniHeader("Leçon 06", "←", "Profil")}
      <div class="lesson-summary"><span class="lesson-big-number">06</span><div><small>CORPUS ACTUEL</small><h4>Leçon 06</h4><p>55 entrées de vocabulaire</p></div></div>
      <div class="two-progress"><div><span>Comprendre <b>68 %</b></span><i><u style="width: 68%"></u></i></div><div><span>Produire <b>41 %</b></span><i><u style="width: 41%"></u></i></div></div>
      <button class="mini-primary lesson-cta">Réviser cette leçon</button>
      <div class="vocab-head"><strong>Vocabulaire</strong><span>55 entrées</span></div>
      <div class="vocab-list">
        ${vocabRow("食べます", "たべます · tabemasu", "manger · to eat · comer", "yellow", "red")}
        ${vocabRow("飲みます", "のみます · nomimasu", "boire · to drink · beber", "green", "yellow")}
        ${vocabRow("見ます", "みます · mimasu", "regarder · to watch · mirar", "red", "red")}
      </div>
    </div>`,

  menu: () => `
    <div class="product-screen app-view menu-view">
      <div class="fake-page"></div>
      <div class="mini-backdrop"></div>
      <aside class="mini-drawer">
        ${miniBrand("×")}
        <nav><button class="active">${uiIcon("book")}<span>Réviser</span></button><button>${uiIcon("chart")}<span>Progression</span></button><button>${uiIcon("globe")}<span>Langue</span></button><button>${uiIcon("user")}<span>Compte</span></button></nav>
        <div class="mini-account"><i>V</i><span><strong>Vincent</strong><small>Progression synchronisée</small></span></div>
      </aside>
    </div>`,

  language: () => `
    <div class="product-screen app-view language-view">
      ${miniHeader("Langue", "←", "Profil")}
      <div class="language-copy"><span class="tiny-eyebrow">LANGUE DE L’APPLICATION</span><h4>Choisis ta langue.</h4><p>Les menus et les textes de l’interface seront traduits.</p></div>
      <div class="language-options">
        <button class="selected"><span>${languageFlag("fr")}</span><strong>Français</strong><small>Français</small><b>✓</b></button>
        <button><span>${languageFlag("en")}</span><strong>English</strong><small>Anglais</small><b></b></button>
        <button><span>${languageFlag("es")}</span><strong>Español</strong><small>Espagnol</small><b></b></button>
      </div>
      <p class="language-note">Ce choix définit aussi la traduction principale affichée dans les quiz.</p>
    </div>`,

  progress: () => `
    <div class="product-screen app-view progress-view">
      ${miniHeader("Progression", "←", "Profil")}
      <div class="mastery"><div class="ring"><span>34<small>%</small></span></div><span><small>MAÎTRISE GLOBALE</small><strong>128 mots</strong><em>maîtrisés dans les deux sens</em></span></div>
      <div class="two-progress compact"><div><span>Comprendre <b>68 %</b></span><i><u style="width:68%"></u></i></div><div><span>Produire <b>41 %</b></span><i><u style="width:41%"></u></i></div></div>
      <div class="vocab-head"><strong>Par leçon</strong><span>18 leçons</span></div>
      <div class="lesson-preview">
        ${lessonRow("01", "44 entrées", "75 %")}
        ${lessonRow("02", "46 entrées", "50 %")}
        ${lessonRow("03", "49 entrées", "30 %")}
        ${lessonRow("04", "60 entrées", "16 %")}
      </div>
    </div>`,

  account: () => `
    <div class="product-screen app-view account-view">
      ${miniHeader("Compte", "←")}
      <div class="profile"><span>V</span><h4>Vincent</h4><p>vincent@example.com</p></div>
      <div class="account-summary"><div><span>Connexion</span><strong>Google · email vérifié</strong></div><div><span>Synchronisation</span><strong>Progression à jour</strong></div></div>
      <button class="logout-button">Se déconnecter</button>
    </div>`,

  logout: () => `
    <div class="product-screen app-view modal-view">
      <div class="fake-page account-fake"></div><div class="mini-backdrop"></div>
      <div class="mini-modal"><span class="round-icon">↪</span><h4>Se déconnecter&nbsp;?</h4><p>Ta progression est déjà synchronisée.</p><button class="danger-button">Se déconnecter</button><button class="mini-secondary">Annuler</button></div>
    </div>`,

  protected: () => `
    <div class="product-screen centered-view protected-view">
      <span class="round-icon">◈</span><span class="tiny-eyebrow">LIEN PROTÉGÉ</span><h4>Connecte-toi pour continuer.</h4><p>Après la connexion, tu reviendras directement à la leçon 06.</p><button class="mini-primary">Se connecter</button><button class="mini-link">Retour à l’accueil</button>
    </div>`,

  exit: () => `
    <div class="product-screen app-view modal-view">
      <div class="fake-page quiz-fake"></div><div class="mini-backdrop"></div>
      <div class="mini-modal"><span class="round-icon">Ⅱ</span><h4>Mettre la passe en pause&nbsp;?</h4><p>Tu pourras reprendre à la question 12 depuis l’accueil.</p><button class="mini-primary">Mettre en pause</button><button class="mini-secondary">Continuer le quiz</button></div>
    </div>`,

  resumeHome: () => `
    <div class="product-screen app-view home-view">
      ${miniBrand("Profil")}
      <div class="welcome"><span class="tiny-eyebrow">PASSE EN COURS</span><h4>Tu étais à la question 12.</h4></div>
      <div class="quick-card resume-card"><div><small>LEÇONS 01 À 06</small><strong>72 questions restantes</strong><span>Comprendre</span></div><i><u style="width:14%"></u></i><button class="mini-primary">Reprendre</button><button class="mini-link">Abandonner cette passe</button></div>
      <div class="section-row"><strong>Leçons</strong><button>Voir tout</button></div>
      <div class="lesson-preview">${lessonRow("01", "44 entrées", "75 %")}${lessonRow("02", "46 entrées", "50 %")}</div>
    </div>`,

  notFound: () => `
    <div class="product-screen centered-view not-found-view">
      <span class="huge-kana">迷</span><span class="tiny-eyebrow">PAGE INTROUVABLE</span><h4>On s’est un peu perdu.</h4><p>Cette adresse n’existe pas ou a été déplacée.</p><button class="mini-primary">Retour à l’accueil</button>
    </div>`
};

const flows = [
  {
    id: "launch-anonymous",
    number: "01",
    title: "Premier lancement · visiteur",
    description: "L’application vérifie la session puis présente le produit. Aucun quiz n’est accessible sans compte.",
    steps: [step("loader", "Chargement", "/"), step("landing", "Accueil public", "/")]
  },
  {
    id: "auth-google",
    number: "02",
    title: "Connexion avec Google",
    description: "Le fournisseur est externe, puis le callback renvoie vers l’accueil connecté.",
    steps: [step("landing", "Accueil public"), step("login", "Méthodes"), step("google", "Google"), step("callback", "Callback"), step("home", "Accueil connecté", "/app")]
  },
  {
    id: "auth-email",
    number: "03",
    title: "Connexion avec une adresse email",
    description: "Proposition actuelle : magic link. Le choix magic link ou OTP reste ouvert.",
    open: true,
    steps: [step("landing", "Accueil public"), step("login", "Méthodes"), step("email", "Adresse email"), branch([step("inbox", "Email envoyé"), step("authError", "Erreur d’envoi")], "Envoi réussi ou erreur"), step("callback", "Callback"), step("home", "Accueil connecté")]
  },
  {
    id: "launch-connected",
    number: "04",
    title: "Lancement · session déjà connue",
    description: "Une session valide évite la page publique et ouvre directement l’espace personnel.",
    steps: [step("loader", "Chargement"), step("home", "Accueil connecté", "/app")]
  },
  {
    id: "quick-review",
    number: "05",
    title: "Révision rapide depuis l’accueil",
    description: "Le raccourci proposé lance dix mots à travailler avec les dernières préférences.",
    open: true,
    steps: [step("home", "Accueil connecté"), step("quiz", "Question"), branch([step("correct", "Bonne réponse"), step("incorrect", "Erreur")], "Selon la réponse"), step("complete", "Fin de passe"), branch([step("home", "Retour accueil"), step("config", "Nouvelle passe")], "Action choisie")]
  },
  {
    id: "custom-review",
    number: "06",
    title: "Quiz entièrement configuré",
    description: "L’utilisateur choisit le périmètre. Un état vide empêche le lancement si aucun mot ne correspond.",
    steps: [step("home", "Accueil connecté"), step("config", "Configuration"), branch([step("quiz", "Questions trouvées"), step("emptyConfig", "Aucune question")], "Résultat du filtre"), step("correct", "Correction"), step("complete", "Fin de passe")]
  },
  {
    id: "lesson-review",
    number: "07",
    title: "Explorer puis réviser une leçon",
    description: "La leçon sélectionnée est transmise à la configuration, qui reste modifiable.",
    steps: [step("homeLessons", "Parcours"), step("lesson", "Détail leçon", "/app/lessons/06"), step("configLesson", "Configuration préremplie"), step("quiz", "Quiz de la leçon"), step("complete", "Bilan")]
  },
  {
    id: "progress-path",
    number: "08",
    title: "Consulter la progression",
    description: "La progression est secondaire dans le menu, mais chaque leçon reste consultable.",
    steps: [step("home", "Accueil"), step("menu", "Menu"), step("progress", "Progression", "/app/progress"), step("lesson", "Détail d’une leçon")]
  },
  {
    id: "language-settings",
    number: "09",
    title: "Changer la langue de l’application",
    description: "La langue de l’interface et la traduction principale du quiz sont synchronisées avec le compte.",
    steps: [step("home", "Accueil"), step("menu", "Menu"), step("language", "Choix de la langue", "/app/language")]
  },
  {
    id: "account-logout",
    number: "10",
    title: "Compte et déconnexion",
    description: "La déconnexion ramène sur la page publique sans conserver de progression métier locale.",
    steps: [step("home", "Accueil"), step("menu", "Menu"), step("account", "Compte", "/app/account"), step("logout", "Confirmation"), step("landing", "Accueil public")]
  },
  {
    id: "protected-link",
    number: "11",
    title: "Ouvrir un lien protégé sans session",
    description: "La destination demandée est conservée et restaurée après la connexion.",
    steps: [step("protected", "Leçon 06 demandée", "/app/lessons/06"), step("login", "Connexion"), step("callback", "Callback"), step("lesson", "Retour à la leçon 06")]
  },
  {
    id: "resume-session",
    number: "12",
    title: "Interrompre puis reprendre une passe",
    description: "Cette branche dépend de la décision de conserver ou non les longues passes interrompues.",
    open: true,
    steps: [step("quiz", "Question 12"), step("exit", "Quitter"), step("resumeHome", "Accueil · passe en cours"), step("quiz", "Reprise question 12"), step("complete", "Fin")]
  },
  {
    id: "not-found",
    number: "13",
    title: "Route inconnue",
    description: "Le retour mène à l’accueil public ou connecté selon la session disponible.",
    steps: [step("notFound", "Page introuvable"), branch([step("landing", "Accueil public"), step("home", "Accueil connecté")], "Selon la session")]
  }
];

function uiIcon(name) {
  const paths = {
    user: '<circle cx="12" cy="8" r="3.5"></circle><path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path>',
    arrowLeft: '<path d="m15 18-6-6 6-6"></path>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
    close: '<path d="m7 7 10 10M17 7 7 17"></path>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z"></path>',
    chart: '<path d="M5 20V10M12 20V4M19 20v-7"></path>',
    globe: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path>',
    volume: '<path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z"></path><path d="M15 9.5a4 4 0 0 1 0 5M17.8 7a7.4 7.4 0 0 1 0 10"></path>'
  };

  return `<svg class="mini-ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function miniBrand(action) {
  const isLoginAction = action === "Connexion";
  const isCloseAction = action === "×";
  const actionLabel = isLoginAction ? "Se connecter" : isCloseAction ? "Fermer le menu" : "Ouvrir le menu du profil";
  const actionContent = isLoginAction ? uiIcon("user") : isCloseAction ? uiIcon("close") : avatarMark();
  const actionClass = !isLoginAction && !isCloseAction ? ' class="profile-trigger"' : "";

  return `<div class="mini-brand"><span class="mini-wordmark-logo kl-brand-art kl-brand-art--wordmark" role="img" aria-label="Kuma Libre"></span><button${actionClass} aria-label="${actionLabel}">${actionContent}</button></div>`;
}

function avatarMark() {
  return '<span class="mini-avatar" aria-hidden="true">V</span>';
}

function languageFlag(code) {
  const flags = {
    ja: '<rect width="24" height="16" rx="2" fill="#fff"></rect><circle cx="12" cy="8" r="4" fill="#bc002d"></circle>',
    fr: '<rect width="8" height="16" fill="#0055a4"></rect><rect x="8" width="8" height="16" fill="#fff"></rect><rect x="16" width="8" height="16" fill="#ef4135"></rect>',
    en: '<rect width="24" height="16" rx="2" fill="#21468b"></rect><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="4"></path><path d="M0 0 24 16M24 0 0 16" stroke="#cf142b" stroke-width="1.6"></path><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5"></path><path d="M12 0v16M0 8h24" stroke="#cf142b" stroke-width="2.6"></path>',
    es: '<rect width="24" height="16" rx="2" fill="#aa151b"></rect><rect y="4" width="24" height="8" fill="#f1bf00"></rect>'
  };

  return `<svg class="language-flag" viewBox="0 0 24 16" aria-hidden="true">${flags[code]}</svg>`;
}

function miniHeader(title, left = "", right = "") {
  const leftButton = left
    ? `<button aria-label="Retour">${uiIcon("arrowLeft")}</button>`
    : '<button aria-hidden="true" tabindex="-1"></button>';
  const rightButton = right
    ? `<button class="profile-trigger" aria-label="Ouvrir le menu du profil">${avatarMark()}</button>`
    : '<button aria-hidden="true" tabindex="-1"></button>';

  return `<div class="mini-header">${leftButton}<strong>${title}</strong>${rightButton}</div>`;
}

function lessonRow(number, entryCount, percent) {
  return `<button class="mini-lesson"><b>${number}</b><span><strong>Leçon ${number}</strong><small>${entryCount}</small></span><em><strong>${percent}</strong><small>maîtrisés</small></em><i>›</i></button>`;
}

function vocabRow(japanese, reading, meaning, understand, produce) {
  return `<div class="vocab-row"><div><strong>${japanese}</strong><small>${reading}</small></div><span>${meaning}</span><i class="status-pair"><b class="${understand}">C</b><b class="${produce}">P</b></i></div>`;
}

function step(screen, label, route = "") {
  return { kind: "screen", screen, label, route };
}

function branch(items, label = "Alternative") {
  return { kind: "branch", items, label };
}

function renderRouteMap() {
  const nodeContainer = document.getElementById("route-nodes");
  const svg = document.getElementById("route-connectors");
  const namespace = "http://www.w3.org/2000/svg";

  svg.setAttribute("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`);
  svg.setAttribute("width", MAP_WIDTH);
  svg.setAttribute("height", MAP_HEIGHT);

  const defs = document.createElementNS(namespace, "defs");
  const marker = document.createElementNS(namespace, "marker");
  marker.setAttribute("id", "route-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "7");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrow = document.createElementNS(namespace, "path");
  arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  marker.appendChild(arrow);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const byId = new Map(routeNodes.map((node) => [node.id, node]));

  routeEdges.forEach((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) return;

    const startX = from.x + NODE_WIDTH;
    const startY = from.y + NODE_HEIGHT / 2;
    const endX = to.x;
    const endY = to.y + NODE_HEIGHT / 2;
    const direction = endX >= startX ? 1 : -1;
    const bend = Math.max(52, Math.abs(endX - startX) * 0.44) * direction;
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`);
    path.setAttribute("marker-end", "url(#route-arrow)");
    path.classList.add("route-edge");
    svg.appendChild(path);

    if (edge.label) {
      const label = document.createElement("span");
      label.className = "edge-label";
      label.textContent = edge.label;
      label.style.left = `${(startX + endX) / 2}px`;
      label.style.top = `${(startY + endY) / 2 - 10}px`;
      nodeContainer.appendChild(label);
    }
  });

  routeNodes.forEach((node) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `route-node route-node--${node.type}${node.open ? " is-open" : ""}`;
    button.style.left = `${node.x}px`;
    button.style.top = `${node.y}px`;
    button.dataset.lane = node.lane;
    button.innerHTML = `<strong>${node.label}</strong><span>${node.meta}</span>${node.open ? "<em>Décision ouverte</em>" : ""}`;
    button.addEventListener("click", () => scrollToLane(node.lane));
    nodeContainer.appendChild(button);
  });
}

function renderStoryboards() {
  const list = document.getElementById("storyboard-list");
  const index = document.getElementById("flow-index");

  flows.forEach((flow) => {
    const jump = document.createElement("button");
    jump.type = "button";
    jump.textContent = `${flow.number} ${flow.title.split("·")[0].trim()}`;
    jump.addEventListener("click", () => scrollToLane(flow.id));
    index.appendChild(jump);

    const article = document.createElement("article");
    article.className = `storyboard-lane${flow.open ? " is-open" : ""}`;
    article.id = `lane-${flow.id}`;
    article.innerHTML = `
      <header class="lane-header">
        <span>${flow.number}</span>
        <div><h3>${flow.title}</h3><p>${flow.description}</p></div>
        ${flow.open ? "<em>Décision ouverte</em>" : ""}
      </header>
      <div class="flow-track" aria-label="${flow.title}">${flow.steps.map(renderFlowStep).join("")}</div>`;
    list.appendChild(article);
  });
}

function renderFlowStep(item, index) {
  const arrow = index === 0 ? "" : `<div class="lane-arrow" aria-hidden="true"><span>→</span></div>`;
  if (item.kind === "branch") {
    return `${arrow}<div class="branch-step"><span class="branch-label">${item.label}</span>${item.items.map(renderScreen).join("")}</div>`;
  }
  return `${arrow}${renderScreen(item)}`;
}

function renderScreen(item) {
  const factory = item.screen === "configLesson" ? () => screenTemplates.config(true) : screenTemplates[item.screen];
  if (!factory) return "";
  return `
    <figure class="screen-step">
      <figcaption><strong>${item.label}</strong>${item.route ? `<code>${item.route}</code>` : ""}</figcaption>
      <div class="phone-mini">
        <div class="phone-notch"></div>
        ${factory()}
      </div>
    </figure>`;
}

function scrollToLane(id) {
  const lane = document.getElementById(`lane-${id}`);
  if (!lane) return;
  lane.scrollIntoView({ behavior: "smooth", block: "start" });
  lane.classList.remove("is-flashed");
  requestAnimationFrame(() => lane.classList.add("is-flashed"));
}

function setupZoom() {
  const viewport = document.getElementById("map-viewport");
  const stage = document.getElementById("map-stage");
  const map = document.getElementById("route-map");
  const output = document.getElementById("zoom-value");
  let zoom = 1;

  const applyZoom = (nextZoom) => {
    zoom = Math.min(1.2, Math.max(0.48, nextZoom));
    map.style.transform = `scale(${zoom})`;
    stage.style.width = `${MAP_WIDTH * zoom}px`;
    stage.style.height = `${MAP_HEIGHT * zoom}px`;
    output.value = `${Math.round(zoom * 100)} %`;
    output.textContent = output.value;
  };

  const fit = () => {
    const available = Math.max(320, viewport.clientWidth - 34);
    applyZoom(Math.min(1, available / MAP_WIDTH));
    viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.zoom;
      if (action === "in") applyZoom(zoom + 0.1);
      if (action === "out") applyZoom(zoom - 0.1);
      if (action === "fit") fit();
    });
  });

  requestAnimationFrame(fit);
}

renderRouteMap();
renderStoryboards();
setupZoom();
