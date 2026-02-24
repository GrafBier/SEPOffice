# SEPOffice – Manuel d'utilisation

**Version 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Table des matières

1. [Aperçu](#1-aperçu)
2. [Installation et démarrage](#2-installation-et-démarrage)
3. [Tableau de bord](#3-tableau-de-bord)
4. [SEPWrite – Traitement de texte](#4-sepwrite--traitement-de-texte)
5. [SEPGrid – Tableur](#5-sepgrid--tableur)
6. [SEPShow – Présentations](#6-sepshow--présentations)
7. [Eliot – Assistant IA](#7-eliot--assistant-ia)
8. [Paramètres](#8-paramètres)
9. [Raccourcis clavier](#9-raccourcis-clavier)

---

## 1. Aperçu

SEPOffice est une suite bureautique de bureau alimentée par l'IA pour Windows, composée de trois applications intégrées :

| Application | Fonction |
|-------------|----------|
| **SEPWrite** | Créer des documents de texte enrichi, export Word/PDF |
| **SEPGrid** | Tableur avec formules et graphiques |
| **SEPShow** | Présentations avec éditeur de canevas |

Les trois applications sont connectées à **Eliot** – un assistant IA intégré qui formule des textes, génère des formules et conçoit des diapositives.

---

## 2. Installation et démarrage

### Installateur
Exécutez `SEPOffice Setup 1.0.1.exe`. L'assistant vous guide à travers l'installation :
- Répertoire d'installation sélectionnable (par défaut : `Program Files\SEPOffice`)
- Une entrée dans le menu Démarrer est créée
- Raccourci bureau optionnel

### Démarrage direct (sans installateur)
Exécutez `release\win-unpacked\SEPOffice.exe`.

### Premier démarrage
Au premier démarrage, le service d'IA charge le modèle de langage (Qwen2.5-0.5B) en arrière-plan. La progression du chargement est visible dans le widget de chat Eliot en bas à droite. Selon le matériel, cela prend **1 à 5 minutes**.

> **Remarque :** L'application est immédiatement utilisable – Eliot devient actif dès que la barre de chargement atteint 100%.

---

## 3. Tableau de bord

![Tableau de bord](assets/screenshots/01_dashboard.png)

Le tableau de bord est la page d'accueil de SEPOffice. Il affiche :

### Trois tuiles d'application
- **SEPWrite** – Créer ou ouvrir un document
- **SEPGrid** – Créer ou ouvrir une feuille de calcul  
- **SEPShow** – Créer ou ouvrir une présentation *(NOUVEAU)*

Cliquez sur une tuile → Nouveau document vide dans l'application respective.

### Documents récemment ouverts
Sous les tuiles apparaissent les documents récemment modifiés avec l'icône de type, le nom et la date de dernière modification. Cliquez sur une entrée pour ouvrir le document directement.

### Navigation
La barre de navigation supérieure est disponible dans toutes les applications :

| Élément | Fonction |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** (Boutons) | Basculer entre les applications |
| ⚙️ | Ouvrir les paramètres |
| ⌨️ | Afficher les raccourcis clavier |
| 🌙 / ☀️ | Basculer mode sombre/clair |

---

## 4. SEPWrite – Traitement de texte

![Éditeur SEPWrite](assets/screenshots/02_sepwrite.png)

SEPWrite est un éditeur de texte enrichi moderne basé sur **TipTap**.

### 4.1 Mise en forme

La barre d'outils offre les options de mise en forme suivantes :

| Symbole | Fonction | Raccourci clavier |
|---------|----------|-------------------|
| **B** | Gras | `Ctrl + B` |
| *I* | Italique | `Ctrl + I` |
| <u>U</u> | Souligné | `Ctrl + U` |
| H1 | Titre 1 | — |
| H2 | Titre 2 | — |
| Liste | Liste à puces | — |
| 1. Liste | Liste numérotée | — |

### 4.2 Insertion d'images

Via **Insérer → Image**, la boîte de dialogue d'insertion d'image s'ouvre :
- Télécharger l'image par glisser-déposer ou sélection de fichier
- Alignement : Gauche, Centre, Droite
- Les images sont intégrées directement dans le document

### 4.3 Enregistrement et exportation de documents

| Action | Description |
|--------|-------------|
| **Enregistrer** | Enregistrement automatique dans le stockage local du navigateur |
| **Exporter en .docx** | Télécharger un document compatible Word |
| **Imprimer / PDF** | Aperçu avant impression avec mise en page, puis imprimer ou enregistrer en PDF |

### 4.4 Assistance IA

Le chat Eliot (→ [Chapitre 7](#7-eliot--assistant-ia)) est entièrement intégré dans SEPWrite. Les brouillons de texte, révisions et reformulations peuvent être demandés directement dans le chat.

---

## 5. SEPGrid – Tableur

![SEPGrid](assets/screenshots/03_sepgrid.png)

SEPGrid est un tableur puissant avec **10 000 lignes × 26 colonnes** par feuille de calcul – comparable à Microsoft Excel et OpenOffice Calc.

### 5.1 Opérations de base

| Action | Description |
|--------|-------------|
| Cliquer sur une cellule | Sélectionner la cellule |
| Double-clic / F2 | Modifier la cellule |
| `Entrée` | Confirmer, passer à la ligne suivante |
| `Tab` | Confirmer, passer à la colonne suivante |
| `Échap` | Annuler la modification |
| `Ctrl + Z` | Annuler |
| `Ctrl + Y` | Rétablir |
| `Ctrl + C` | Copier |
| `Ctrl + V` | Coller |
| `Ctrl + X` | Couper |
| `Ctrl + B` | Gras |
| `Ctrl + I` | Italique |
| `Ctrl + U` | Souligné |
| `Ctrl + F` | Rechercher et remplacer |
| `Suppr` | Effacer le contenu de la cellule |

**Sélection multiple :** Glisser la souris avec le bouton gauche enfoncé ou `Maj + Clic`.

**Poignée de recopie :** Faire glisser le carré bleu en bas à droite d'une cellule pour copier des valeurs ou des formules.

### 5.2 La barre de formules

La barre de formules se trouve sous le ruban :

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Adresse    Symbole de     Champ de saisie (affiche la formule brute)
  de cellule formule
```

- **Adresse de cellule** : Affiche la cellule active ou la plage sélectionnée (ex. `A1:B5`)
- **Symbole fx** : Indique la saisie de formule
- **Champ de saisie** : Affiche toujours la formule brute (ex. `=SUM(A1:A10)`) – pas le résultat

**Affichage des erreurs :** Pour les erreurs de formule comme `#ERROR`, `#REF!`, `#DIV/0!` etc., le champ de saisie obtient une bordure rouge et le type d'erreur est affiché à droite.

### 5.3 Saisie de formules

La saisie de formule commence toujours par `=` :

```
=SUM(A1:A10)           Somme
=AVERAGE(B1:B5)        Moyenne
=MAX(C1:C100)          Maximum
=MIN(D1:D50)           Minimum
=COUNT(A:A)            Comptage
=IF(A1>0,"Oui","Non")  Condition
=VLOOKUP(...)          Recherche
=ROUND(A1, 2)          Arrondir
```

#### Références de formule par clic de souris

Au lieu de taper manuellement les adresses de cellules :

1. Tapez `=` ou une fonction comme `=SUM(`
2. Cliquez sur la cellule souhaitée → L'adresse est insérée
3. Faites glisser pour les plages → La plage est insérée (ex. `A1:B10`)

Cela fonctionne après `=`, `(`, `+`, `-`, `*`, `/`, `,` et `!`.

#### Accès rapide aux formules

Cliquez sur le **symbole de calculatrice (fx)** pour ouvrir les suggestions de formules :
- SUM(), AVERAGE(), MAX(), MIN(), COUNT(), IF()
- Lorsqu'une plage est sélectionnée, elle est automatiquement insérée

### 5.4 Formules inter-feuilles

Références à d'autres feuilles de calcul – comme dans Excel :

```
=Feuille2!A1                    Cellule unique de Feuille2
=SUM(Feuille2!A1:B10)           Somme de Feuille2
=Feuille1!A1 + Feuille2!B5      Combinaison de plusieurs feuilles
=AVERAGE(Ventes!C1:C100)        Plage de la feuille "Ventes"
```

**Par clic de souris :**
1. Tapez `=` dans une cellule
2. Cliquez sur un autre onglet de feuille → `Feuille2!` est inséré
3. Cliquez sur la cellule souhaitée → `A1` est ajouté

### 5.5 Formats de nombres

Via le **symbole 123** dans la barre d'outils :

| Format | Exemple | Description |
|--------|---------|-------------|
| Standard | 1234,5 | Pas de formatage |
| Nombre | 1 234,56 | Notation standard avec 2 décimales |
| Devise | 1 234,56 € | Format monétaire |
| Pourcentage | 12,5 % | Valeur × 100 avec signe % |
| Milliers | 1 234 | Nombres entiers avec séparateur de milliers |
| Date | 24/02/2026 | Format de date |

### 5.6 Fusionner les cellules

Combiner plusieurs cellules en une seule :

1. Sélectionner la plage de cellules
2. **Insérer → Fusionner les cellules**
3. Seule la valeur de la cellule en haut à gauche est conservée

**Annuler la fusion :** Même position dans le menu ou **Insérer → Annuler la fusion**

### 5.7 Mise en forme conditionnelle

Formater automatiquement les cellules en fonction des valeurs :

1. Sélectionner la plage
2. **Édition → Mise en forme conditionnelle...**
3. Choisir la règle :
   - Supérieur à / Inférieur à
   - Égal à
   - Entre (deux valeurs)
   - Le texte contient
4. Choisir les couleurs pour le texte et l'arrière-plan
5. **Ajouter**

*Exemple :* Surligner toutes les valeurs supérieures à 1000 en vert.

**Supprimer :** Sélectionner la plage → **Édition → Supprimer la mise en forme conditionnelle**

### 5.8 Figer les volets

Garder les en-têtes de lignes ou de colonnes visibles lors du défilement :

1. Sélectionner la cellule à partir de laquelle le défilement doit commencer
2. **Affichage → Figer les volets**
3. Toutes les lignes au-dessus et les colonnes à gauche de la sélection sont figées

**Libérer :** **Affichage → Libérer les volets**

### 5.9 Commentaires

Ajouter des notes aux cellules :

1. Sélectionner la cellule
2. **Insérer → Ajouter un commentaire**
3. Entrer le texte → OK

Les cellules avec commentaires affichent un **triangle rouge** dans le coin supérieur droit. Une info-bulle apparaît au survol.

### 5.10 Rechercher et remplacer

`Ctrl + F` ou **Édition → Rechercher et remplacer** :

- **Rechercher** : Entrer le texte, naviguer dans les résultats avec ◀ ▶
- **Remplacer** : Remplacer un par un ou tous en une fois

### 5.11 Insérer/Supprimer des lignes et des colonnes

**Via le menu Insérer :**
- Insérer une ligne au-dessus/en dessous
- Insérer une colonne à gauche/à droite
- Supprimer une ligne/colonne

La position est basée sur la sélection actuelle.

### 5.12 Barre d'état

En bas, les statistiques sont automatiquement affichées pour les sélections multiples :

```
Σ Somme : 12 345   ⌀ Moyenne : 1 234   ↓ Min : 100   ↑ Max : 5 000   Nombre : 10
```

### 5.13 Importation / Exportation

| Fonction | Format | Description |
|----------|--------|-------------|
| Importer | `.xlsx`, `.xlsm` | Ouvrir des fichiers Excel |
| Import CSV | `.csv` | Fichiers séparés par virgule/point-virgule |
| Exporter | `.xlsx` | Enregistrer comme fichier Excel |
| Export CSV | `.csv` | Enregistrer comme fichier CSV (UTF-8, point-virgule) |
| Imprimer / PDF | — | Aperçu avant impression, seulement les lignes remplies |
| Insérer une image | PNG, JPG | Intégrer une image dans la zone du tableur |

### 5.14 Fonctions IA

#### Générateur de formules IA
Cliquez sur **✨** dans la barre de formules :
> « Calculer la moyenne de toutes les valeurs positives dans la colonne B »  
> → `=AVERAGEIF(B:B,">0")`

#### Assistant de tableau IA
Superposition glassmorphisme en cliquant sur le bouton IA :
> « Créer un tableau des ventes mensuelles pour 2025 avec les colonnes : Mois, Revenus, Coûts, Bénéfice »

#### Vibe Writing
Activer via **Fichier → Activer Vibe Writing** : Assistance IA pendant la saisie.

### 5.15 Aperçu des raccourcis clavier

| Raccourci | Fonction |
|-----------|----------|
| `Ctrl + Z` | Annuler |
| `Ctrl + Y` | Rétablir |
| `Ctrl + C` | Copier |
| `Ctrl + V` | Coller |
| `Ctrl + X` | Couper |
| `Ctrl + B` | Gras |
| `Ctrl + I` | Italique |
| `Ctrl + U` | Souligné |
| `Ctrl + F` | Rechercher et remplacer |
| `F2` | Modifier la cellule |
| `Entrée` | Confirmer + descendre |
| `Tab` | Confirmer + aller à droite |
| `Échap` | Annuler |
| `Suppr` | Effacer le contenu |
| `Maj + Clic` | Étendre la plage |

---

## 6. SEPShow – Présentations

![SEPShow](assets/screenshots/04_sepshow.png)

SEPShow est un éditeur de présentations basé sur les diapositives utilisant **Konva** (moteur de rendu canvas).

### 6.1 Interface

| Zone | Description |
|------|-------------|
| **Barre latérale gauche** | Liste des diapositives – aperçu de toutes les diapositives, réorganisation par glisser-déposer |
| **Zone principale** | Éditeur de canevas de la diapositive active |
| **Barre d'outils (haut)** | Outils, exportation, mode présentation |
| **Notes du présentateur (bas)** | Notes pour la diapositive actuelle |

### 6.2 Insérer des éléments

Via la barre d'outils :

| Action | Description |
|--------|-------------|
| **Texte** | Placer une zone de texte sur la diapositive |
| **Image** | Insérer une image via téléchargement ou presse-papiers |
| **Forme** | Rectangles, cercles, etc. |
| **Mise en page IA** | L'IA génère une mise en page complète de diapositive |

Tous les éléments peuvent :
- Être déplacés librement avec la souris
- Être redimensionnés (poignées de coin)
- Être pivotés

### 6.3 Gestion des diapositives

| Action | Description |
|--------|-------------|
| **+** dans la barre latérale | Ajouter une nouvelle diapositive |
| Clic droit sur la diapositive | Dupliquer, supprimer, déplacer |
| Glisser-déposer dans la barre latérale | Modifier l'ordre |

### 6.4 Mode présentation

Cliquez sur **Présenter** (icône d'écran) pour ouvrir la présentation en plein écran :
- Navigation : touches fléchées `→` / `←` ou clic
- `Échap` quitte le mode présentation

### 6.5 Notes du présentateur

Sous le canevas se trouve un champ de notes pour chaque diapositive. Les notes sont visibles uniquement dans l'éditeur, pas pendant la présentation.

### 6.6 Exportation

| Format | Description |
|--------|-------------|
| Enregistrer | Dans le stockage local (automatique) |
| PDF/Imprimer | Exporter les diapositives en PDF |

---

## 7. Eliot – Assistant IA

![Chat Eliot](assets/screenshots/05_eliot.png)

Eliot est l'assistant IA intégré disponible dans les trois applications.

### 7.1 Le widget de chat

Le **symbole Eliot flottant** se trouve en bas à droite dans toutes les applications. Cliquez dessus pour ouvrir la fenêtre de chat.

#### Indicateurs d'état

| Symbole | État |
|---------|------|
| 💬 (normal) | IA prête – tapez une demande |
| ⏳ (tournant) | IA en chargement – le modèle s'initialise |
| ❌ (rouge) | Erreur ou non connecté |

#### Progression du chargement
Au premier démarrage, une **barre de chargement** (0–100%) apparaît pendant que le modèle de langage est chargé en mémoire.

### 7.2 Travailler avec Eliot

Tapez une demande dans le champ de saisie du chat et confirmez avec `Entrée` ou le bouton d'envoi.

**Exemples de demandes :**

*Dans SEPWrite :*
- « Rédigez une introduction professionnelle pour un rapport sur les énergies renouvelables »
- « Révisez ce texte pour qu'il soit plus formel »
- « Résumez le texte suivant en 3 phrases »

*Dans SEPGrid :*
- « Quelle formule calcule la moyenne mobile sur 5 valeurs ? »
- « Créez une formule qui trouve la valeur la plus élevée dans la colonne C »

*Dans SEPShow :*
- « Créez une diapositive sur le changement climatique avec 3 points »
- « Suggérez un schéma de couleurs pour une présentation professionnelle »

### 7.3 Texte fantôme (Auto-complétion)

Dans SEPWrite, Eliot offre le **Texte fantôme** – un aperçu de texte gris pâle pendant que vous tapez. `Tab` accepte la suggestion.

### 7.4 Démarrer le service IA (manuellement)

Si le service IA ne démarre pas automatiquement, un bouton **« Démarrer le service IA »** apparaît dans le widget Eliot. Cliquez pour démarrer le service manuellement.

---

## 8. Paramètres

La fenêtre des Paramètres (⚙️ dans la barre de navigation) contient :

### Paramètres IA
| Option | Description |
|--------|-------------|
| **URL de l'API** | URL du backend IA (par défaut : `http://localhost:8080`) |
| **Clé API** | Optionnel, pour les API IA externes |
| **Tester la connexion** | Vérifie si le service IA est accessible |

### Langue
SEPOffice prend en charge **29 langues**. La langue peut être sélectionnée dans la boîte de dialogue des Paramètres et s'applique à l'ensemble de l'interface utilisateur.

---

## 9. Raccourcis clavier

La fenêtre d'Aide (⌨️ dans la barre de navigation) affiche tous les raccourcis clavier.

### Global

| Raccourci | Fonction |
|-----------|----------|
| `Ctrl + Z` | Annuler |
| `Ctrl + Y` | Rétablir |
| `Ctrl + S` | Enregistrer |

### SEPWrite

| Raccourci | Fonction |
|-----------|----------|
| `Ctrl + B` | Gras |
| `Ctrl + I` | Italique |
| `Ctrl + U` | Souligné |
| `Ctrl + P` | Imprimer |

### SEPGrid

| Raccourci | Fonction |
|-----------|----------|
| `Entrée` | Confirmer la cellule, descendre |
| `Tab` | Confirmer la cellule, aller à droite |
| `Échap` | Annuler la modification |
| `Ctrl + C` | Copier |
| `Ctrl + V` | Coller |
| `F2` | Modifier la cellule |
| Touches fléchées | Naviguer dans les cellules |
| `Maj + Touches fléchées` | Sélection multiple |

### SEPShow

| Raccourci | Fonction |
|-----------|----------|
| `→` / `←` | Diapositive suivante / précédente (mode présentation) |
| `Échap` | Quitter le mode présentation |
| `Ctrl + D` | Dupliquer la diapositive |
| `Suppr` | Supprimer l'élément sélectionné |

---

## Notes techniques

- **Stockage des données :** Tous les documents sont enregistrés localement dans le stockage du navigateur (`localStorage`). Aucune donnée n'est transmise à des serveurs externes.
- **Modèle IA :** Qwen2.5-0.5B fonctionne entièrement en local – aucune connexion Internet requise pour les fonctions IA.
- **Configuration requise :** Windows 10/11, min. 4 Go de RAM (8 Go recommandés pour le modèle IA)
- **Désinstallation :** Via Windows « Applications et fonctionnalités » → Désinstaller SEPOffice

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
