# NAYA — AI Care Assistant (Wenaya Clinic)

Prototype Next.js App Router : un assistant de parcours de santé **conversationnel d'abord**, bilingue FR/EN, qui recueille les informations du patient et prépare une **demande de booking** pour Wenaya Clinic.

> **Démonstration locale.** Aucune API n'est appelée, aucun contenu n'est persisté, aucun document n'est envoyé, aucune recommandation médicale n'est produite. NAYA n'est pas un médecin et ne pose aucun diagnostic.

## Démarrage

```bash
npm install
npm run dev -- -p 3015
```

Ouvrir [http://localhost:3015](http://localhost:3015).

Gates de validation :

```bash
npm run lint
npx tsc --noEmit
npm run build
node_modules\.bin\next.cmd start -p 3015
```

Le rapport de recette (97/97 contrôles navigateur) est dans [docs/qa-report.md](docs/qa-report.md) et les captures dans `docs/screenshots/`.

## Parcours démontré

| Étape | Contenu |
| --- | --- |
| 1. Bienvenue | Cadre, confidentialité, urgence, consentement explicite avant toute saisie |
| 2. Vos mots | Situation décrite librement |
| 3. Contexte | Depuis quand, à titre indicatif |
| 4. Examens | Examens ou consultations existants |
| 5. Documents | Jusqu'à trois pièces jointes (métadonnées locales uniquement) ou « Continuer sans document » |
| 6. Synthèse | Résumé relisible et modifiable avant d'aller plus loin |
| 7. Suggestion | Point de départ générique, sans professionnel attribué, sans diagnostic |
| 8. Revue humaine | Parcours alternatif, lui aussi simulé |
| 9. Booking | Nom, téléphone, e-mail, consentement explicite, résumé éditable |
| 10. Confirmation | Réception simulée, **sans référence inventée** |

Le vocabulaire est volontairement **BOOKING** (pas de « liste d'attente »). L'assistant **ne propose ni date, ni horaire, ni créneau, ni paiement** : Wenaya Clinic confirme les modalités et recontacte le patient. Aucune réservation de rendez-vous n'est générée.

Bascule FR/EN disponible à tout moment ; le changement de langue réinitialise la session.

## Architecture

| Couche | Fichiers | Rôle |
| --- | --- | --- |
| Modèles | `src/lib/conversation/types.ts` | Types stricts : messages, étapes, pièces jointes, résumé, suggestion, booking, résultat, erreur |
| Moteur | `src/lib/conversation/mock-engine.ts` | Implémentation déterministe, remplaçable, sans logique clinique |
| Booking | `src/lib/booking/mock-booking-service.ts` | Soumission simulée, erreursinjectables, contrat d'interface |
| Contrat | `src/lib/conversation/api-contract.ts` | Interface HTTP **proposée** (`v1`), jamais appelée par l'UI |
| i18n | `src/lib/i18n/copy.ts` | Tout le texte FR/EN, typé par `Copy` |
| Interface | `src/components/care-assistant/` | Contrôleur d'état + panneaux (welcome, chat, résumé, suggestion, revue, booking, confirmation) |
| Page | `src/app/page.tsx` | Point d'entrée unique |
| Thème | `src/app/globals.css` | Tokens Wenaya, focus visible, `prefers-reduced-motion` |

L'interface dépend de `ConversationEngine` et de `BookingService`, pas d'une implémentation particulière ; le mock est la valeur par défaut et le point de remplacement pour une API réelle.

## États de démonstration

- **Simuler une erreur de l'IA** — panneau de Bienvenue et écran de booking : déclenche un état d'erreur avec message, conservation de la saisie et action « Réessayer ».
- **Outils de démonstration** — accès direct à l'aperçu du parcours.

## Confidentialité

- Aucun `localStorage`, cookie, analytics ni appel réseau ; le contrôle navigateur « no external network calls » le vérifie.
- Les fichiers sélectionnés sont réduits à leur nom, taille, type et poids de lecture pour la démonstration ; leur contenu n'est ni lu en mémoire au-delà des métadonnées, ni envoyé.
- Les messages vivent dans l'état React de la page et disparaissent au rechargement.
- Aucune donnée de santé n'apparaît dans une URL.
- Une version connectée devra ajouter consentement versionné, expiration de session, chiffrement, contrôle d'accès, journal d'audit, politique de conservation et revue clinique avant toute mise en production.

## Documentation

- [docs/jamal-handoff.md](docs/jamal-handoff.md) — contrat API proposé, décisions de conception, points à trancher avec l'équipe backend.
- [docs/qa-report.md](docs/qa-report.md) — recette, ports de vue, contrôles automatisés.
