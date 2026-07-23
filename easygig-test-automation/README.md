# 🚀 EasyGIG Test Automation Framework

Framework professionale per **Test Automation End-to-End (E2E)** ed **API Testing** per l'ecosistema a microservizi EasyGIG.

## 🛠️ Tecnologia
- **BDD Framework**: [Cucumber JS](https://cucumber.io/) con specifica **Gherkin (.feature)** in Italiano.
- **Automation Engine**: [Playwright](https://playwright.dev/) (API Request Context & Chromium Browser).
- **Reportistica**: [Allure Framework](https://allurereport.org/).

---

## 📁 Struttura Progetto

```text
easygig-test-automation/
├── features/                 # File .feature contenenti gli Scenari Gherkin BDD
│   ├── api_auth.feature      # Autenticazione & Profile API
│   ├── api_slots.feature     # Creazione Slot & Vincolo Anti-Overlap (409 Conflict)
│   ├── api_bookings.feature  # Lista Prenotazioni
│   └── ui_director.feature   # Navigazione Browser Frontend React
├── src/
│   ├── steps/                # Step Definitions in TypeScript
│   │   ├── auth.steps.ts
│   │   ├── slots.steps.ts
│   │   ├── bookings.steps.ts
│   │   └── ui.steps.ts
│   └── utils/
│       └── apiHelper.ts      # Utility JWT & Request Context
├── package.json
└── tsconfig.json
```

---

## ⚡ Come Eseguire i Test

### 1. Esecuzione della Suite Completa (API + UI)
```bash
npm run test
```

### 2. Generazione del Report Allure
```bash
npm run report:generate
```

### 3. Visualizzazione del Report Allure
```bash
npm run report:open
```

---

## 🧪 Scenari di Test Inclusi

1. **Autenticazione con credenziali valide** (`/auth/login` 200 OK + JWT Role check)
2. **Autenticazione fallita con password errata** (`401 Unauthorized`)
3. **Recupero profilo utente** (`/users/{id}`)
4. **Creazione ed eliminazione slot libero** (`/slots` 201 Created -> 204 No Content)
5. **Rifiuto slot sovrapposto** (Constraint Anti-Overlap `409 Conflict`)
6. **Recupero prenotazioni utente** (`/bookings/user/{id}`)
7. **Navigazione UI Browser** (Playwright Chromium su `http://localhost:4200/`)
