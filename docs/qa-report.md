# Rapport de recette — NAYA (AI Care Assistant)

Prototype : `C:\Users\hp\wenaya-care-assistant` · Build de production sur `http://localhost:3015`.

## Résultat

| Gate | Résultat |
| --- | --- |
| `npx tsc --noEmit` | OK — aucune erreur |
| `npm run lint` | OK — 0 erreur, 0 avertissement |
| `npm run build` | OK — `/`, `/_not-found`, `/icon.svg` en statique |
| `GET /` sur `:3015` | HTTP 200 |
| Recette navigateur (CDP + Edge headless) | **97/97** |
| Erreurs console / exceptions JS | 0 |
| Appels réseau externes | 0 |

## Méthode

- Serveur de production : `node_modules\.bin\next.cmd start -p 3015`.
- Recette pilotée par CDP (Chrome DevTools Protocol) sur un Edge headless dédié, port de debug distinct et `--user-data-dir` jetable.
- Port de vue : **1440×900** (bureau), **1024×768** (tablette), **390×844** (mobile).
- Langues : FR et EN sur le chemin complet, avec contrôle d'absence de fuite de langue (`no FR leak`).
- Stabilité : les contrôles de scroll et d'animation sont mesurés en boucle jusqu'à stabilisation, pas à un instant fixe.
- Harnais : `%TEMP%\opencode\naya-qa.mjs` (hors dépôt, temporaire).

## Couverture

### Cadre, confidentialité, consentement
- Un seul `<h1>` par écran, dans les deux langues.
- Locale par défaut `fr`, bascule EN/EN persistante.
- **Démarrage bloqué tant que le consentement n'est pas coche.**
- Consigne d'urgence, refus de diagnostic et cadrage de confidentialité présents.
- **Aucun champ date / heure / créneau dans tout le document.**

### Conversation
- Erreur IA simulée : message d'erreur + action « Réessayer » + reprise de la conversation.
- Chips de réponse localisées (`Oui` / `Non` / `Je ne sais pas`).
- Pièce jointe : input résolu, métadonnées locales uniquement, aucune donnée envoyée.
- Synthèse : conserve la situation, les examens, le décompte des documents ; refus de diagnostic explicite.
- Édition de la synthèse : efface les réponses en aval, message d'invitation, valeurs modifiées reflétées.
- « Aucun document » affiché quand aucun fichier n'est ajouté.

### Suggestion et revue humaine
- Un seul `<h1>`, aucun débordement horizontal.
- Refus de diagnostic ; **aucun professionnel attribué**.
- Mention explicite que la clinique confirme la suite.
- Offre de revue humaine ; parcours de revue humaine simulé ; **aucun rendez-vous réservé** ; promesse de recontact conservée ; retour à la suggestion.

### Booking
- Un seul `<h1>`, aucun débordement.
- **Aucune date ni horaire** ; 3 champs obligatoires (nom, téléphone, e-mail) ; consentement explicite ; résumé éditable ; mention de simulation.
- Soumission vide : **4 messages de validation** (nom, téléphone, e-mail, consentement) et on reste sur l'écran.
- Édition du résumé : `textarea` + `select` de statut des examens ; valeur modifiée persistée.
- E-mail invalide rejeté.
- Erreur simulée : état d'erreur **réessayable**, **formulaire conservé**.
- Confirmation : un seul `<h1>`, recontact promis, **aucune référence**, marquage simulation, **aucun identifiant inventé**, **aucun paiement**, **aucune date ni heure**, nom du patient et consultation suggérée rappelés.

### Responsive et internationalisation
- FR/EN × 1440 / 1024 / 390 : aucun débordement horizontal (390/390, 1009/1024, 1425/1440).
- Sidebar visible en ≥1024, masquée en 390 ; barre de progression mobile présente.
- Bascule de langue : état mis à jour, **aucune fuite FR en EN** sur les écrans summary / suggestion / human review / booking / confirmation.
- Raccourci « voir l'aperçu du parcours » présent et conservant un seul `<h1>`.

### Comportement de scroll du transcript
- Le transcript défile **à l'intérieur** de la zone de conversation (verrouillage de la hauteur sur desktop) : `scrollHeight 1025` / `clientHeight 227`.
- Auto-scroll jusqu'au message le plus récent, mesuré jusqu'à stabilisation.
- Un scroll de l'utilisateur vers le haut **ne** force **pas** de retour automatique.
- Le contrôle « Aller au dernier message » apparaît, se déclenche, et ramène en bas (`gap: 0`).

### Réseau et console
- **Aucun appel réseau externe.**
- **Aucune exception JavaScript non interceptée.**
- **Aucune erreur console** (le favicon manquant a été corrigé via `src/app/icon.svg`).

## Défauts corrigés pendant la recette

1. **Chips d'examens inversés** — `mock-engine.ts` passait le libellé et la valeur dans le mauvais ordre ; les boutons FR/EN affichaient des réponses incohérentes.
2. **Layout desktop non verrouillé à la hauteur du viewport** — la zone de conversation poussait la page et le transcript ne pouvait pas défiler en interne (`lg:h-[100svh]`, `lg:overflow-hidden`, `lg:grid-rows-[minmax(0,1fr)]`).
3. **Transcript non recalé sur le message le plus récent** quand le panneau de synthèse remplace le composeur — l'auto-scroll dépendait de `messages`/`isThinking` seulement, et les événements `scroll` générés par l'animation lisse passaient pour un geste utilisateur.
4. **Contrôle « Aller au dernier message » inopérant** — l'animation douce était annulée par le commit qui masque le bouton ; la cible est maintenant ré-affirmée au frame suivant.
5. **404 favicon** — console non propre ; corrigé par `src/app/icon.svg`.
6. Fuite de langue et libellés de test(`innerText` applique `text-transform: uppercase`) — corrigés dans le harnais, pas dans l'application.

## Captures

`docs/screenshots/` (19 captures, générées par la recette finale) :

| Fichier | Contenu |
| --- | --- |
| `01-welcome-fr-desktop.png` | Bienvenue FR, bureau |
| `02-chat-error-fr.png` | Erreur IA simulée + réessai |
| `03-conversation-fr-documents.png` | Étape documents |
| `04-summary-fr.png` | Synthèse FR |
| `05-suggestion-fr.png` | Suggestion FR |
| `06-human-review-fr.png` | Revue humaine FR |
| `07-booking-form-fr.png` | Formulaire booking FR |
| `08-booking-validation-fr.png` | Erreurs de validation |
| `09-booking-error-fr.png` | Erreur de soumission |
| `10-confirmation-fr.png` | Confirmation FR |
| `11-welcome-en-desktop.png` | Bienvenue EN, bureau |
| `12-welcome-en-tablet.png` | Bienvenue EN, tablette |
| `13-welcome-en-mobile.png` | Bienvenue EN, mobile |
| `14-summary-en-mobile.png` | Synthèse EN, mobile |
| `15-suggestion-en-mobile.png` | Suggestion EN, mobile |
| `16-human-review-en-mobile.png` | Revue humaine EN, mobile |
| `17-booking-en-mobile.png` | Booking EN, mobile |
| `18-confirmation-en-mobile.png` | Confirmation EN, mobile |
| `19-sidebar-preview-en.png` | Aperçu du parcours depuis la sidebar |

## Reproduction

```bash
cd C:\Users\hp\wenaya-care-assistant
npm run lint
npx tsc --noEmit
npm run build
node_modules\.bin\next.cmd start -p 3015
```

Puis, dans un autre terminal, le harnais CDP temporaire `%TEMP%\opencode\naya-qa.mjs` (Edge headless sur un port de debug dédié ; tuer `msedge.exe` avant et après chaque exécution).

## Réserves

- Recette sur Chromium (Edge headless). Firefox et Safari non testés.
- Les parcours « IA simulée » sont déterministes par construction ; ils ne valident pas la qualité d'un futur moteur réel.
- Le contrat `api-contract.ts` est une **proposition** : aucun backend n'a été appelé ni implémenté.
- Aucune revue clinique, juridique ou de conformité n'a été conduite sur les textes.
