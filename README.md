# PrüfungStore Pro 🇩🇪📚

Plateforme web e-commerce officielle, fiches produits de commande dédiées, module de recherche & catalogue en direct, et Dashboard d'administration pour les manuels certifiés de préparation aux examens d'allemand (**TELC B1/B2** et **GOETHE-ÖSD B1/B2**) au Maroc.

---

## 📁 Répertoire Unique & Consolidé du Projet

Tous les fichiers du projet sont centralisés et enregistrés dans ce même dossier :  
**`C:\Users\HP\.gemini\antigravity\scratch\german-exam-store\`**

```text
german-exam-store/
├── index.html                   # 🛍️ Boutique Principale (Hero 3D, Bento, Catégories, Comparatif, Reels Autoplay, Footer)
├── categories.html              # 🏛️ Page Catégories Complète avec Recherche en Direct, Tri & Filtres Capsules
├── catalog-filter.html          # 🔍 Composant Autonome de Recherche & Filtres Capsules
├── pack-b1-telc.html            # 📖 Page Dédiée de Commande du Pack B1 TELC (235 DH • 3 Volumes)
├── pack-b2-telc.html            # 📖 Page Dédiée de Commande du Pack B2 TELC (260 DH)
├── goethe-osd-b1.html           # 📖 Page Dédiée de Commande du Pack B1 GOETHE • ÖSD (235 DH)
├── goethe-osd-b2.html           # 📖 Page Dédiée de Commande du Pack B2 GOETHE • ÖSD (235 DH)
├── admin.html                   # 🔐 Dashboard Administrateur (Login sécurisé, Commandes, Stock, CRM)
├── dashboard.html               # 🔐 Alias direct vers le Dashboard Admin
├── student-assessment.html      # 📊 Dashboard Analytique des Scores des Étudiants
├── server.js                    # 🚀 Serveur HTTP Node.js (Streaming Range MP4, Port 3001)
├── package.json                 # 📦 Définition du projet et scripts de démarrage (npm run dev)
├── README.md                    # 📖 Documentation complète et consolidée
├── assets/                      # 🖼️ Logos, Médias & Vidéos officielles
│   ├── official-logo.png        # 🇩🇪 Logo Officiel PrüfungStore (Haute Définition)
│   ├── telc-official-logo.svg   # 🟦 Logo Officiel telc gGmbH
│   ├── goethe-osd-official-logo.svg # 🟩 Logo Officiel Goethe-Institut & ÖSD
│   ├── germany-flag.svg         # 🇩🇪 Drapeau Allemand Vectoriel
│   ├── instagram_wordmark.svg   # 📸 Logo Script Cursif Instagram Officiel
│   ├── instagram_wordmark.png   # 📸 Version PNG du logo Instagram
│   ├── instagram_reel_1.mp4     # 🎬 Vidéo Reel 1 (Présentatrice AB DEUTSCH • مرحبا جميعا • 0:33)
│   ├── instagram_reel_1.jpg     # 🖼️ Affiche poster Reel 1
│   ├── instagram_reel_2.mp4     # 🎬 Vidéo Reel 2 (Explications examens B1/B2)
│   ├── instagram_reel_2.jpg     # 🖼️ Affiche poster Reel 2
│   ├── site-bg.jpg              # 🏛️ Arrière-plan bibliothèque académique
│   └── products/                # 📚 Couvertures des manuels et photos réelles
│       ├── pack-b1.png
│       ├── goethe-osd-b1-b2.jpg
│       ├── telc-b1-showcase.jpg
│       └── telc-real-collection.jpg
└── src/
    ├── app.js                   # ⚙️ Moteur interactif (Three.js, Recherche temps réel, Panier, WhatsApp)
    ├── theme.css                # 🎨 Moteur CSS Dynamique (Mode Sombre / Mode Clair, Lecteur Vidéo, Responsive Mobile)
    ├── theme.js                 # 🌓 Gestionnaire de thème avec persistance localStorage
    └── data/
        └── books.js             # 🗄️ Base de données des manuels, packs officiels, prix et caractéristiques
```

---

## 🌐 Liens Localhost & Accès Rapide

Le serveur local écoute sur le port **3001** :

| Page | URL Directe | Description |
|---|---|---|
| **Boutique Principale** | [http://localhost:3001/](http://localhost:3001/) | Boutique client complète avec Reels en lecture automatique et nouveau footer. |
| **Catégories & Recherche** | [http://localhost:3001/categories.html](http://localhost:3001/categories.html) | Tous les 7 manuels & packs avec recherche et tri instantanés. |
| **Pack B1 TELC** | [http://localhost:3001/pack-b1-telc.html](http://localhost:3001/pack-b1-telc.html) | Fiche produit professionnelle (3 volumes, 235 DH, WhatsApp & COD). |
| **Pack B2 TELC** | [http://localhost:3001/pack-b2-telc.html](http://localhost:3001/pack-b2-telc.html) | Fiche produit complète & commande 1 clic (260 DH). |
| **Pack B1 GOETHE • ÖSD** | [http://localhost:3001/goethe-osd-b1.html](http://localhost:3001/goethe-osd-b1.html) | Fiche produit officielle (235 DH). |
| **Pack B2 GOETHE • ÖSD** | [http://localhost:3001/goethe-osd-b2.html](http://localhost:3001/goethe-osd-b2.html) | Fiche produit officielle (235 DH). |
| **Espace Administrateur** | [http://localhost:3001/admin.html](http://localhost:3001/admin.html) | Portail admin (`admin` / `admin2026`). |

---

## 📱 Fonctionnalités Récemment Intégrées

1. **📱 Réactivité Mobile Complète** :
   - Barre de navigation mobile inférieure style application native (Accueil, Catégories, Panier avec badge dynamique, Thème, WhatsApp).
   - Formulaires sans auto-zoom iOS (taille minimale 16px).
   - Défilement tactile fluide et zéro débordement horizontal.
2. **📸 Section Instagram & Reels Fidèle au Modèle** :
   - Carte Instagram blanche avec typographie cursive officielle.
   - Vidéos réelles MP4 en lecture automatique en boucle (`autoplay muted loop playsinline`).
   - Barre de lecteur vidéo avec timecode en direct (`0:00 / 0:33`), bouton de son (`🔊 / 🔇`) et curseur de progression.
3. **🏷️ Harmonisation PrüfungStore** :
   - Suppression du badge `PRO` superflu à côté du logo dans la navbar.
   - Restructuration du pied de page avec navigation rapide, packs en accès direct et marque PrüfungStore.

---

## 💻 Commandes Utiles

- Démarrer le serveur local : `npm run dev` ou `node server.js`
- Le serveur bascule automatiquement sur le port 3001 (ou le prochain port libre).
