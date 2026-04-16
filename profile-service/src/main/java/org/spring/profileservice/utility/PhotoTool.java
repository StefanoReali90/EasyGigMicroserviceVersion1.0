package org.spring.profileservice.utility;

import org.spring.profileservice.entity.Photo;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public class PhotoTool {

    /**
     * Garantisce l'integrità della foto principale:
     * 1. Se ci sono troppe foto primarie, mantiene solo la prima trovata.
     * 2. Se non ce n'è nessuna, imposta la prima della lista come primaria.
     */
    public void validatePrimaryPhoto(List<Photo> photos) {
        long primaryCount = photos.stream().filter(Photo::isPrimary).count(); //salvo il conteggio delle foto
        if (primaryCount > 1) { //se il conteggio è meggio di 1
            boolean foundFirst = false; //setto la variabile foundFIrst a false
            for (Photo photo : photos) {//itero sulle foto
                if (photo.isPrimary()) {//per ogni foto verifico se sia la foto primaria
                    if (foundFirst) photo.setPrimary(false); //se non è primaria setto a false
                    else foundFirst = true; //altrimenti setto a true
                }
            }
        } else if (primaryCount == 0 && !photos.isEmpty()) { //Caso: nessuna foto primaria. Imposta di default la prima della lista.
            photos.get(0).setPrimary(true);
        }
    }
}
