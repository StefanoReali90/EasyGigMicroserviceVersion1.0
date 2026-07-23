# language: it
Funzionalità: Gestione Candidature e Prenotazioni Booking

  Scenario: Recupero dell'elenco prenotazioni di un utente
    Dato che sono autenticato nel sistema
    Quando richiedo le prenotazioni per l'utente con ID 5
    Allora la risposta HTTP ha codice di stato 200
    E la lista delle prenotazioni non è nulla
