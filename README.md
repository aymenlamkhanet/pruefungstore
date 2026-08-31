# PrüfungStore Pro • ABDEUTSCH CENTER 🇩🇪📚

Plateforme web e-commerce complète et Dashboard d'administration pour la vente et la gestion de manuels de préparation aux examens officiels d'allemand (**TELC B1/B2** et **GOETHE-ÖSD B1/B2**) au Maroc.

---

## 📁 Structure Unifiée du Projet

Tous les fichiers du projet sont regroupés dans ce dossier :
`C:\Users\HP\.gemini\antigravity\scratch\german-exam-store\`

```text
german-exam-store/
├── index.html                   # 🛍️ Boutique publique client (Catalogue, Panier, WhatsApp COD)
├── admin.html                   # 🔐 Dashboard Administrateur (Login sécurisé, CRUD, Commandes, CRM)
├── dashboard.html               # 🔐 Alias direct vers le Dashboard Admin
├── student-assessment.html      # 📊 Dashboard Analytique & Scores des Étudiants
├── server.js                    # 🚀 Serveur HTTP local Node.js (Anti-cache headers)
├── README.md                    # 📖 Documentation officielle du projet
├── assets/                      # 🖼️ Images & Ressources graphiques
│   ├── germany_bg.jpg           # Arrière-plan crépusculaire Berlin / Brandebourg (Généré par Gemini)
│   ├── site-bg.jpg              # Arrière-plan bibliothèque du store public
│   ├── logo.jpg                 # Logo officiel PrüfungStore & ABDEUTSCH
│   └── products/                # Couvertures des manuels et packs
│       ├── pack-b1.png
│       ├── goethe-osd-b1-b2.jpg
│       ├── telc-b1-showcase.jpg
│       └── telc-real-collection.jpg
└── src/
    ├── app.js                   # Moteur JavaScript interactif de la boutique
    └── data/
        └── books.js             # Base de données initiale des manuels et prix
```

---

## 🌐 Liens Localhost & Accès

Une fois le serveur démarré (`node server.js`), les pages sont accessibles sur le port **3000** :

| Page | URL | Description |
|---|---|---|
| **Boutique Client** | `http://localhost:3000/` | Storefront public avec commande WhatsApp et formulaire COD. |
| **Portail Admin** | `http://localhost:3000/admin.html` | Dashboard sécurisé pour l'administrateur. |
| **Dashboard BI** | `http://localhost:3000/student-assessment.html` | Suivi et analyse des performances des étudiants. |

---

## 🔐 Identifiants Administrateur

* **Nom d'utilisateur** : `admin`
* **Mot de passe** : `admin2026`

---

## ✨ Fonctionnalités Majeures

### 1. 🛍️ Boutique Publique (`index.html`)
- Présentation des packs B1 & B2 avec prix officiels en Dirhams marocains (DH).
- Panier dynamique et commande directe sur WhatsApp au **`+212 632-017446`**.
- Accès discret au portail d'administration via l'icône **`🛡️`** dans la barre supérieure ou le lien **`Espace Admin 🔐`** dans le pied de page.

### 2. 🇩🇪 Dashboard Administrateur (`admin.html`)
- **Écran de connexion sécurisé** avec alerte animée en cas de mot de passe erroné.
- **Arrière-plan haute définition de Berlin** avec effets de verre dépoli (*Glassmorphism*).
- **Importation de photos** : bouton *« Choisir une photo... »* pour uploader n'importe quelle image depuis l'ordinateur/téléphone avec prévisualisation en direct.
- **Gestion des stocks & Produits** : Ajout, modification, ajustement rapide (+ / -) et suppression.
- **Suivi des commandes** : Changement de statut en 1 clic (🟡 En attente, 🔵 En cours, 🟣 Expédiée, 🟢 Livrée, 🔴 Annulée).
- **CRM WhatsApp** : Historique des commandes clients et relance instantanée sur WhatsApp.
- **Exportations** : Export des données en format CSV (Excel) et JSON.
- **Verrouillage automatique** : Déconnexion sécurisée dès que vous retournez à la boutique publique.

---

## 🚀 Démarrer le Serveur Local

Pour lancer ou relancer le serveur local :
```bash
node server.js
```
Le serveur écoute sur **`http://localhost:3000/`**.
