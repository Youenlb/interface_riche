# Commandes Git pour chaque commit

## Prérequis
Assurez-vous d'être dans le dossier `rich-media-project/`.

---

## Commit 1 - Youen: Structure de base (types, utils, data)
```bash
git add src/app/types.tsx src/app/utils.ts src/app/data.ts
git commit -m "feat: ajout des types, utilitaires et fetching de données" --author="Youen <youen@email.com>"
```

## Commit 2 - Youen: Gestion du Player + Sous-titres + Audiodescription
```bash
git add src/components/Player.tsx src/components/AudioDescriptionManager.tsx public/subtitles/
git commit -m "feat: lecteur vidéo avec sous-titres et audiodescription" --author="Youen <youen@email.com>"
```

## Commit 3 - Youen: Gestion des chapitres
```bash
git add src/components/Chapters.tsx
git commit -m "feat: navigation par chapitres du film" --author="Youen <youen@email.com>"
```

## Commit 4 - Killian: Gestion du chat
```bash
git add src/components/Chat.tsx
git commit -m "feat: chat en temps réel avec WebSocket et timecodes" --author="Killian <killian@email.com>"
```

## Commit 5 - Eliott: Gestion de la map
```bash
git add src/components/MapDisplay.tsx
git commit -m "feat: carte interactive avec points d'intérêt" --author="Eliott <eliott@email.com>"
```

## Commit 6 - Eliott: Agencement final
```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: intégration et agencement des composants" --author="Eliott <eliott@email.com>"
```
