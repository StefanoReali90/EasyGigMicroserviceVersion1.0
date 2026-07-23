import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import * as venueApi from '../api/venues';
import * as profileApi from '../api/profile';
import { useAuthStore } from '../store/authStore';

const venueUpdateSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  phone: z.string().min(5, "Telefono non valido"),
  capacity: z.coerce.number().min(1, "Capienza non valida"),
  equipment: z.string().min(10, "Descrizione tecnica troppo breve"),
  type: z.enum(["STANDING", "SEATED", "TABLES", "MIXED"]),
  cityId: z.coerce.number().min(1, "Seleziona una città"),
  street: z.string().min(2, "Indirizzo obbligatorio"),
  houseNumber: z.string().min(1, "Civico obbligatorio"),
  zipCode: z.string().length(5, "CAP deve essere di 5 cifre"),
});

export default function VenueSettings() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(venueUpdateSchema),
  });

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const data = await venueApi.getVenuesByDirector(user.id);
        const currentVenue = data.find(v => v.id == venueId);
        if (currentVenue) {
          setVenue(currentVenue);
          reset({
            name: currentVenue.name,
            phone: currentVenue.phone,
            capacity: currentVenue.capacity,
            equipment: currentVenue.equipment,
            type: currentVenue.type,
            cityId: currentVenue.address?.city?.id,
            street: currentVenue.address?.street,
            houseNumber: currentVenue.address?.houseNumber,
            zipCode: currentVenue.address?.zipCode,
          });
          setCitySearch(currentVenue.address?.city?.name || "");
          setSelectedCity(currentVenue.address?.city);
        }
      } catch (error) {
        console.error("Errore recupero locale:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenue();
  }, [venueId, user.id, reset]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2 && (!selectedCity || citySearch !== selectedCity.name)) {
        try {
          const data = await profileApi.searchCities(citySearch);
          setCities(data || []);
        } catch (error) {
          console.error("Errore ricerca città:", error);
        }
      } else {
        setCities([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [citySearch, selectedCity]);

  const onPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const updatedVenue = await venueApi.uploadVenuePhoto(venueId, file, venue.photos?.length === 0);
      setVenue(updatedVenue);
      alert("Foto caricata con successo!");
    } catch (error) {
      console.error("Errore upload foto:", error);
      alert("Errore durante il caricamento della foto.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await venueApi.updateVenue(venueId, {
        ...data,
        directorId: user.id
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Errore aggiornamento:", error);
      alert("Errore durante l'aggiornamento dei dati.");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-slate-200 p-6 lg:p-10 font-sans selection:bg-indigo-600/30 overflow-x-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="badge-indigo mb-1">Impostazioni Struttura</span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Impostazioni {venue?.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">Modifica le informazioni tecniche, l'indirizzo e le immagini del locale</p>
            </div>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold animate-fade-in">
              <CheckCircle2 size={16} />
              <span>Salvato!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Dati */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-6 lg:p-8 rounded-2xl space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nome Locale</label>
                  <input {...register("name")} className="input-studio w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Telefono</label>
                  <input {...register("phone")} className="input-studio w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Capienza (PAX)</label>
                  <input type="number" {...register("capacity")} className="input-studio w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tipo Sala</label>
                  <select {...register("type")} className="input-studio w-full">
                    <option value="STANDING" className="bg-slate-900">In Piedi</option>
                    <option value="SEATED" className="bg-slate-900">Seduti</option>
                    <option value="TABLES" className="bg-slate-900">Tavoli</option>
                    <option value="MIXED" className="bg-slate-900">Misto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Attrezzatura Tecnica & Scheda Audio</label>
                <textarea {...register("equipment")} rows="4" className="input-studio w-full resize-none" />
              </div>

              {/* Indirizzo */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Indirizzo e Località</h3>
                
                <div className="relative space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Città</label>
                  <input 
                    value={citySearch} 
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      if (selectedCity) setSelectedCity(null);
                    }}
                    placeholder="Cerca città..." 
                    className="input-studio w-full" 
                  />
                  {cities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-44 overflow-y-auto">
                      {cities.map(c => (
                        <button key={c.id} type="button" onClick={() => {
                          setSelectedCity(c);
                          setCitySearch(c.name);
                          setValue("cityId", c.id);
                          setCities([]);
                        }} className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-xs text-slate-300 border-b border-slate-800/50 last:border-none">
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Via / Indirizzo</label>
                    <input {...register("street")} className="input-studio w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Civico</label>
                    <input {...register("houseNumber")} className="input-studio w-full" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">CAP</label>
                  <input {...register("zipCode")} className="input-studio w-full" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 text-xs">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={16} /> Salva Modifiche</>}
              </button>
            </form>
          </div>

          {/* Gestione Foto */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-400" /> Galleria Foto Locale
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {venue?.photos?.map((photo, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-800">
                    <img src={photo.source} alt="Venue" className="w-full h-full object-cover" />
                    {photo.primary && (
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
                        Principale
                      </div>
                    )}
                  </div>
                ))}
                
                <label className="border border-dashed border-slate-800 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all cursor-pointer">
                  <Upload size={20} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">Aggiungi Foto Locale</span>
                  <input type="file" className="hidden" onChange={onPhotoUpload} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
