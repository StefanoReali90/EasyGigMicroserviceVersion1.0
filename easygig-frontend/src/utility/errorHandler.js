export const getErrorMessage = (error, topic = "operazione") => {
  if (error.response) {
    // Il server ha risposto con uno stato diverso da 2xx
    const status = error.response.status;
    const data = error.response.data;

    // Se il backend ha fornito un messaggio specifico, usiamolo
    if (data && data.message) {
      return data.message;
    }

    // Altrimenti, mappiamo in base allo stato
    switch (status) {
      case 400:
        return `Dati non validi per ${topic}. Controlla i campi inseriti.`;
      case 401:
        return "Sessione scaduta o non autorizzata. Effettua nuovamente il login.";
      case 403:
        return `Non hai i permessi per completare questa ${topic}.`;
      case 404:
        return `Risorsa non trovata durante ${topic}.`;
      case 409:
        return `Conflitto rilevato: ${topic} potrebbe essere già esistente o occupata.`;
      case 500:
        return `Errore del server durante ${topic}. Riprova più tardi.`;
      default:
        return `Si è verificato un errore (${status}) durante ${topic}.`;
    }
  } else if (error.request) {
    // La richiesta è stata fatta ma non è stata ricevuta risposta
    return "Impossibile comunicare con il server. Controlla la tua connessione.";
  } else {
    // Errore durante l'impostazione della richiesta
    return `Errore imprevisto durante ${topic}: ${error.message}`;
  }
};
