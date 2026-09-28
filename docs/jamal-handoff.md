# Handoff NAYA — AI Care Assistant (Wenaya Clinic)

Document destiné à Jamal et à l'équipe backend. Il décrit ce qui est implémenté dans le prototype, la frontière exacte avec une future API, et les décisions à valider avant toute mise en production.

Dernière recette : **97/97 contrôles navigateur** — voir [qa-report.md](qa-report.md).

## 1. Périmètre livré

Application autonome Next.js App Router + TypeScript + Tailwind CSS v4, sur le port `3015` :

```bash
npm install
npm run dev -- -p 3015
```

Le parcours est conversationnel d'abord, bilingue FR/EN, et **non clinique** :

1. Cadre, confidentialité, urgence, **consentement explicite** avant toute saisie.
2. Situation décrite par la personne avec ses propres mots.
3. Question de contexte adaptée à l'étape courante.
4. Réponse `oui / non / je ne sais pas` sur les examens ou consultations existants.
5. Jusqu'à trois métadonnées de documents PDF ou image, ou « Continuer sans document ».
6. **Synthèse relisible et modifiable** avant d'aller plus loin.
7. **Suggestion** de point de départ générique, sans professionnel attribué, sans diagnostic.
8. Option **revue humaine** (parcours alternatif, lui aussi simulé).
9. Écran **booking** : nom, téléphone, e-mail, consentement explicite, résumé éditable.
10. **Confirmation** simulée, sans référence inventée.

## 2. Frontières de sécurité produit

Le prototype ne doit pas être présenté comme un outil de diagnostic ou de triage.

- **Aucun appel réseau** depuis l'interface (contrôlé par la recette).
- **Aucun** `localStorage`, cookie, analytics ni persistance ; tout vit dans l'état React et disparaît au rechargement.
- **Aucune donnée de santé dans une URL.**
- Le contenu des fichiers n'est pas lu : seuls `name`, `sizeBytes`, `contentType` et `kind` sont conservés en mémoire.
- Vocabulaire **BOOKING** uniquement — pas de « liste d'attente ».
- **Aucune date, aucun horaire, aucun créneau, aucun paiement, aucune réservation de rendez-vous.** Wenaya Clinic confirme les modalités et recontacte le patient.
- Les écrans affichent un avertissement de démonstration, une consigne d'urgence et un refus explicite de poser un diagnostic.
- `requestId` et `reference` valent `null` côté prototype : aucune référence n'est inventée.

Avant une version connectée, faire valider : périmètre clinique, contenu du parcours, gestion des urgences, consentement versionné, durée de conservation, chiffrement, traçabilité, droits d'accès, supervision humaine, anonymisation des logs.

## 3. Architecture frontend

### Modèles

`src/lib/conversation/types.ts` définit :

- `ConversationStage` : `welcome`, `concern`, `context`, `examinations`, `documents`, `summary`, `suggestion`, `human-review`, `booking`, `confirmation` ;
- `Message`, `QuickReply`, `ConversationInput`, `EngineReply`, `ConversationSnapshot` ;
- `Attachment` (métadonnées locales), `ConversationSummary` ;
- `ConsultationSuggestion`, `ConsultationStatus` (`suggested` | `human-review`), `HumanReviewState` ;
- `PatientContact`, `ConsentRecord`, `BookingFormSubmission`, `BookingRequest` ;
- `BookingStatus` (`idle` | `submitting` | `confirmed` | `error`), `BookingSubmissionResult`, `BookingSubmissionError` ;
- `ConversationEngine` et `BookingService` : les deux interfaces à implémenter côté réel.

### Moteur et service

- `src/lib/conversation/mock-engine.ts` implémente `ConversationEngine` de façon déterministe, sans aucun calcul clinique.
- `src/lib/booking/mock-booking-service.ts` implémente `BookingService` : soumission simulée, latence simulée, erreurs injectables.
- `CareAssistant` accepte `engine` et `bookingService` en props ; les mocks sont les valeurs par défaut et le **point de remplacement** pour une API réelle, sans réécrire l'interface.

### Contrat API

`src/lib/conversation/api-contract.ts` contient la proposition de transport. `createNayaApi(baseUrl, fetchImpl)` existe comme adaptateur prêt à être branché, mais **n'est appelé par aucun composant**. `NayaApiError` expose `status`, `code`, `requestId` et `retryable`.

## 4. Contrat API proposé

Préfixe : `/api/naya/v1` (`NAYA_API_VERSION = "v1"`).

| Opération | Endpoint |
| --- | --- |
| Créer une session | `POST /api/naya/v1/sessions` |
| Envoyer un message | `POST /api/naya/v1/sessions/{sessionId}/messages` |
| Obtenir le résumé | `GET /api/naya/v1/sessions/{sessionId}/summary` |
| Obtenir la suggestion | `GET /api/naya/v1/sessions/{sessionId}/suggestion` |
| Préparer un dépôt de document | `POST /api/naya/v1/sessions/{sessionId}/attachments` |
| Déposer une demande de booking | `POST /api/naya/v1/booking-requests` |

### Créer une session

```json
{ "locale": "fr", "channel": "web", "client": { "name": "wenaya-naya-web", "version": "0.2.0" } }
```

```json
{ "sessionId": "opaque-session-id", "expiresAt": "2026-01-01T00:00:00.000Z" }
```

### Envoyer un message

```json
{
  "clientMessageId": "user-12",
  "message": "Je souhaite comprendre mon bilan.",
  "stage": "concern",
  "testStatus": null,
  "attachments": [{ "name": "resultats.pdf", "sizeBytes": 182344, "contentType": "application/pdf" }]
}
```

```json
{
  "message": { "id": "assistant-13", "role": "assistant", "text": "Merci pour ces éléments.", "tone": "accent", "attachments": [] },
  "nextStage": "context",
  "quickReplies": [{ "id": "context-weeks", "label": "Depuis plusieurs semaines", "value": "Depuis plusieurs semaines" }]
}
```

`clientMessageId` est stable : il permet au client de rejouer un message après une erreur réseau sans dupliquer l'étape.

### Obtenir le résumé

`GET /api/naya/v1/sessions/{sessionId}/summary` → `{ "summary": ConversationSummary }`.

### Obtenir la suggestion

`GET /api/naya/v1/sessions/{sessionId}/suggestion` → `{ "suggestion": ConsultationSuggestion }`.

La suggestion est un **point de départ générique** : elle ne doit contenir ni professionnel attribué, ni créneau, ni verdict clinique. `ConsultationStatus` distingue le parcours « suggestion » du parcours « revue humaine ».

### Préparer un dépôt de document

`POST /api/naya/v1/sessions/{sessionId}/attachments`

```json
{ "fileName": "resultats.pdf", "sizeBytes": 182344, "contentType": "application/pdf" }
```

```json
{
  "attachment": { "id": "attachment-12", "name": "resultats.pdf", "sizeBytes": 182344, "kind": "pdf" },
  "uploadUrl": "https://signed-storage.example/upload/...",
  "uploadHeaders": { "Content-Type": "application/pdf" },
  "expiresAt": "2026-01-01T00:15:00.000Z"
}
```

Le client ne doit jamais envoyer un document vers une URL arbitraire. L'URL signée doit être courte, limitée au type et à la taille, et le fichier analysé côté service de documents.

### Déposer une demande de booking

`POST /api/naya/v1/booking-requests` — charge utile = `BookingRequest` :

```json
{
  "conversationReference": "session-or-local-id",
  "locale": "fr",
  "contact": { "fullName": "…", "phone": "…", "email": "…" },
  "suggestedConsultationId": "…",
  "suggestedConsultationTitle": "…",
  "intakeSummary": { "concern": "…", "contextAnswer": "…", "testStatus": "unsure", "attachments": [], "note": "…" },
  "attachmentReferences": [],
  "consent": { "accepted": true, "capturedAt": "2026-01-01T00:00:00.000Z", "version": "…" },
  "simulated": true
}
```

Réponse :

```json
{ "status": "received", "requestId": null, "reference": null, "simulated": true, "message": "…" }
```

Points à trancher côté backend :

- `requestId` / `reference` restent `null` tant que la clinique ne définit pas de format de référence. **Si une référence est un jour produite, elle doit venir du service, jamais être générée côté client.**
- `simulated` doit disparaître (ou devenir `false`) dès qu'un vrai service est branché ; le client s'en sert pour l'affichage « démonstration locale ».
- La réponse ne doit contenir **ni date, ni créneau** : la confirmation des modalités reste un acte humain de la clinique.

## 5. Erreurs et résilience

```json
{ "error": "session_expired", "message": "…", "requestId": "req_01H…", "retryable": true }
```

Codes à prévoir au minimum : `bad_request`, `session_expired`, `session_not_found`, `unsupported_attachment`, `rate_limited`, `service_unavailable`.

`NayaApiError.retryable` pilote l'affichage de l'action « Réessayer » ; le client conserve la saisie en cas d'échec (déjà vérifié par la recette). Le client doit distinguer une erreur de transport d'un refus métier, sans exposer de détail sensible dans l'interface.

## 6. Points à trancher

1. Le moteur réel est-il une règle métier interne, un service IA, ou une combinaison validée par le comité clinique ?
2. Quelles données sont strictement nécessaires à chaque étape ?
3. Quels documents sont acceptés, avec quelle taille maximale et quelle durée de conservation ?
4. Quel est le parcours d'escalade vers un humain, et qui est notifié ?
5. Quels textes sont autorisés en français, en anglais et en arabe, et quelle revue éditoriale est requise ?
6. Qui produit — et sous quel format — une éventuelle référence de demande ?
7. Quels tests de sécurité et de conformité avant une collecte réelle ?

## 7. Vérifications avant intégration

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Le prototype est prêt à être démontré sur `http://localhost:3015`. Il ne doit pas être exposé publiquement comme service médical sans revue backend, clinique, sécurité et conformité.
