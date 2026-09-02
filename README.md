# PrüfungStore Pro • ABDEUTSCH CENTER 🇩🇪📚

Plateforme web e-commerce complète, pages dédiées de commande, module de recherche & catalogue, et Dashboard d'administration pour les manuels officiels de préparation aux examens d'allemand (**TELC B1/B2** et **GOETHE-ÖSD B1/B2**) au Maroc.

---

## 📁 Répertoire Unique & Consolidé du Projet

Tous les fichiers du projet sont centralisés dans ce même dossier :  
**`C:\Users\HP\.gemini\antigravity\scratch\german-exam-store\`**

```text
german-exam-store/
├── index.html                   # 🛍️ Boutique Principale épurée (Hero 3D, Bento, 2 Catégories, Comparatif)
├── categories.html              # 🏛️ Page Catégories Complète avec Recherche en Direct & Filtres
├── catalog-filter.html          # 🔍 Composant Autonome de Recherche & Filtres Capsules (Style Référence)
├── pack-b1-telc.html            # 📖 Page Dédiée de Commande du Pack B1 TELC (235 DH)
├── pack-b2-telc.html            # 📖 Page Dédiée de Commande du Pack B2 TELC (260 DH)
├── goethe-osd-b1.html           # 📖 Page Dédiée de Commande du Pack B1 GOETHE • ÖSD (235 DH)
├── goethe-osd-b2.html           # 📖 Page Dédiée de Commande du Pack B2 GOETHE • ÖSD (235 DH)
├── admin.html                   # 🔐 Dashboard Administrateur (Login sécurisé, Commandes, Stock, CRM)
├── dashboard.html               # 🔐 Alias d'accès direct vers le Dashboard Admin
├── student-assessment.html      # 📊 Dashboard Analytique des Résultats & Scores des Étudiants
├── server.js                    # 🚀 Serveur HTTP Node.js multi-ports (Port par défaut : 3001)
├── package.json                 # 📦 Définition du projet (scripts npm start / npm run dev)
├── README.md                    # 📖 Documentation complète et consolidée
├── assets/                      # 🖼️ Logos et médias officiels
│   ├── official-logo.png        # 🇩🇪 Logo Officiel B1 B2 Vorbereitung (Haute Définition)
│   ├── telc-official-logo.svg   # 🟦 Logo Officiel Vectoriel telc gGmbH (Language Tests)
│   ├── goethe-osd-official-logo.svg # 🟩 Logo Officiel Vectoriel Goethe-Institut & ÖSD
│   ├── germany-flag.svg         # 🇩🇪 Drapeau Allemand Vectoriel (Coins Arrondis)
│   ├── site-bg.jpg              # 🏛️ Arrière-plan bibliothèque académique
│   └── products/                # 📚 Couvertures des manuels et photos réelles
│       ├── pack-b1.png
│       ├── goethe-osd-b1-b2.jpg
│       ├── telc-b1-showcase.jpg
│       └── telc-real-collection.jpg
└── src/
    ├── app.js                   # ⚙️ Moteur interactif (3D Three.js, Live Search, Tiroir Panier, WhatsApp)
    ├── theme.css                # 🎨 Moteur de thèmes dynamique (Variables CSS Mode Sombre & Mode Clair)
    ├── theme.js                 # 🌓 Gestionnaire de bascule de thème avec persistance localStorage
    └── data/
        └── books.js             # 🗄️ Base de données des 7 manuels, packs, prix et caractéristiques
```

---

## 🌐 Liens Localhost & Accès Rapide

Le serveur local écoute sur le port **3001** (pour éviter les conflits de port) :

| Page | URL Directe | Description |
|---|---|---|
| **Boutique Principale** | [http://localhost:3001/](http://localhost:3001/) | Boutique client épurée avec les deux catégories officielles. |
| **Catégories & Recherche** | [http://localhost:3001/categories.html](http://localhost:3001/categories.html) | Tous les produits et packs avec recherche et tri en direct. |
| **Composant Autonome** | [http://localhost:3001/catalog-filter.html](http://localhost:3001/catalog-filter.html) | Module de recherche et filtres capsules isolé. |
| **Pack B1 TELC** | [http://localhost:3001/pack-b1-telc.html](http://localhost:3001/pack-b1-telc.html) | Fiche produit complète & formulaire WhatsApp (235 DH). |
| **Pack B2 TELC** | [http://localhost:3001/pack-b2-telc.html](http://localhost:3001/pack-b2-telc.html) | Fiche produit complète & formulaire WhatsApp (260 DH). |
| **Pack B1 GOETHE • ÖSD** | [http://localhost:3001/goethe-osd-b1.html](http://localhost:3001/goethe-osd-b1.html) | Fiche produit complète & formulaire WhatsApp (235 DH). |
| **Pack B2 GOETHE • ÖSD** | [http://localhost:3001/goethe-osd-b2.html](http://localhost:3001/goethe-osd-b2.html) | Fiche produit complète & formulaire WhatsApp (235 DH). |
| **Espace Administrateur** | [http://localhost:3001/admin.html](http://localhost:3001/admin.html) | Portail admin privé (login: `admin` / mdp: `admin2026`). |

---

## 🚀 Comment Lancer le Projet

```bash
# Dans le dossier german-exam-store :
npm run dev
# Ou bien :
npm start
```

---

## 🌓 Fonctionnalités Clés

1. **Bascule Mode Sombre 🌙 / Mode Clair ☀️** : Persistance automatique via `localStorage` et lisibilité textuelle absolue auditée sur tous les écrans.
2. **Arrière-plan Bibliothèque** : L'image académique s'adapte en temps réel selon le thème sans perdre ses détails.
3. **Recherche & Tri Instantanés** : Recherche par mots-clés et tri par prix/popularité en temps réel.
4. **Commande WhatsApp COD (Cash on Delivery)** : Envoi automatisé des détails de commande sur le numéro officiel **+212 632-017446**.
