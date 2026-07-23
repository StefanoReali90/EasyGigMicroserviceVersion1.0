# language: it
Funzionalità: Gestione Slot Orari e Vincolo Anti-Sovrapposizione

  Scenario: Creazione ed eliminazione con successo di uno slot libero
    Dato che sono autenticato nel sistema
    Quando creo uno slot per il locale 1 per la data "2027-01-15" dalle "21:00" alle "22:00"
    Allora la risposta HTTP ha codice di stato 201
    E lo slot appena creato viene eliminato con successo con risposta 204

  Scenario: Rifiuto della creazione di uno slot sovrapposto (Anti-Overlap Constraint)
    Dato che sono autenticato nel sistema
    Quando creo uno slot per il locale 1 per la data "2027-01-20" dalle "21:00" alle "22:00"
    E tento di creare uno slot sovrapposto per la data "2027-01-20" dalle "21:30" alle "22:30"
    Allora la risposta HTTP ha codice di stato 409
    E la risposta contiene il messaggio "Esiste già uno slot che si sovrappone"
