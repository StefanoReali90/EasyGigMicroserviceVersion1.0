# language: it
Funzionalità: Autenticazione Utenti e Gestione Profilo via API

  Scenario: Autenticazione con credenziali valide
    Quando invio una richiesta POST a "/auth/login" con email "stefanoreali.whs@gmail.com" e password "Killer90231"
    Allora la risposta HTTP ha codice di stato 200
    E la risposta contiene un campo "token" valido
    E il ruolo dell'utente è "ARTIST"

  Scenario: Autenticazione fallita con password errata
    Quando invio una richiesta POST a "/auth/login" con email "stefanoreali.whs@gmail.com" e password "Errata123!"
    Allora la risposta HTTP ha codice di stato 401

  Scenario: Recupero del profilo dell'utente registrato
    Dato che sono autenticato nel sistema
    Quando richiedo il profilo utente per l'ID 5
    Allora la risposta HTTP ha codice di stato 200
    E l'email del profilo corrisponde a "stefanoreali.whs@gmail.com"
