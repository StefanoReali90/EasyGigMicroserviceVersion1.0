import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Landmark, 
  Phone, 
  Users, 
  Settings, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  
  // Stati per la ricerca città
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
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

  // Autocomplete città
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2 && (!selectedCity || citySearch !== selectedCity.name)) {
        setIsSearchingCities(true);
        try {
          const data = await profileApi.searchCities(citySearch);
          setCities(data);
        } catch (error) {
          console.error("Errore ricerca città:", error);
        } finally {
          setIsSearchingCities(false);
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

  if (isLoading) return <div className="min-h-screen bg-easygig-dark flex items-center justify-center"><Loader2 className="animate-spin text-easygig-accent" size={48} /></div>;

  return (
    <div className="min-h-screen bg-easygig-dark text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="bg-slate-900 p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Impostazioni Locale</h1>
              <p className="text-slate-400">Modifica i dettagli e le foto di {venue?.name}</p>
            </div>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl animate-fade-in">
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold uppercase">Salvato!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Dati */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Locale</label>
                  <input {...register("name")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefono</label>
                  <input {...register("phone")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Capienza</label>
                  <input type="number" {...register("capacity")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo Sala</label>
                  <select {...register("type")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all appearance-none">
                    <option value="STANDING">In Piedi</option>
                    <option value="SEATED">Seduti</option>
                    <option value="TABLES">Tavoli</option>
                    <option value="MIXED">Misto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attrezzatura Tecnica</label>
                <textarea {...register("equipment")} rows="4" className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all resize-none" />
              </div>

              {/* Indirizzo */}
              <div className="pt-4 border-t border-white/5 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-easygig-accent">Indirizzo e Località</h3>
                
                <div className="relative space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Città</label>
                  <input 
                    value={citySearch} 
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      if (selectedCity) setSelectedCity(null);
                    }}
                    placeholder="Cerca città..." 
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" 
                  />
                  {cities.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {cities.map(c => (
                        <button key={c.id} type="button" onClick={() => {
                          setSelectedCity(c);
                          setCitySearch(c.name);
                          setValue("cityId", c.id);
                          setCities([]);
                        }} className="w-full text-left px-4 py-3 hover:bg-easygig-accent/20 border-b border-white/5 last:border-none">
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Via</label>
                    <input {...register("street")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Civico</label>
                    <input {...register("houseNumber")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CAP</label>
                  <input {...register("zipCode")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent transition-all" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-easygig-accent hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salva Modifiche</>}
              </button>
            </form>
          </div>

          {/* Gestione Foto */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <ImageIcon size={18} className="text-easygig-accent" /> Gallery Foto
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {venue?.photos?.map((photo, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10">
                    <img src={photo.source} alt="Venue" className="w-full h-full object-cover" />
                    {photo.primary && (
                      <div className="absolute top-2 left-2 bg-easygig-accent text-[8px] font-bold uppercase px-2 py-1 rounded-full shadow-lg">
                        Principale
                      </div>
                    )}
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-white/10 rounded-2xl aspect-video flex flex-col items-center justify-center gap-2 hover:border-easygig-accent/50 hover:bg-easygig-accent/5 transition-all cursor-pointer">
                  <Upload size={24} className="text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aggiungi Foto</span>
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
