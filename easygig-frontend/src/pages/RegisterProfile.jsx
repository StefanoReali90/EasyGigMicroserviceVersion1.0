import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Music, MapPin, DollarSign, Info, Phone, Users, Landmark, ArrowRight, ArrowLeft, Search as SearchIcon, Loader2 } from "lucide-react";

// Schemi di validazione dinamici
const artistSchema = z.object({
  name: z.string().min(2, "Il nome della band è obbligatorio"),
  cachet: z.coerce.number().min(0, "Il cachet non può essere negativo"),
  negotiable: z.boolean(),
  bandType: z.enum(["ORIGINAL", "TRIBUTE", "BOTH"]),
  cityId: z.coerce.number().min(1, "Seleziona una città dalla lista"),
});

const venueSchema = z.object({
  name: z.string().min(2, "Il nome del locale è obbligatorio"),
  phone: z.string().min(5, "Inserisci un numero di telefono valido"),
  capacity: z.coerce.number().min(1, "La capienza deve essere maggiore di 0"),
  equipment: z.string().min(10, "Descrivi brevemente l'attrezzatura tecnica"),
  type: z.enum(["STANDING", "SEATED", "TABLES", "MIXED"]),
  cityId: z.coerce.number().min(1, "Seleziona una città dalla lista"),
});

const promoterSchema = z.object({
  name: z.string().min(2, "Il nome dell'organizzazione è obbligatorio"),
  partitaIva: z.string().length(11, "La Partita IVA deve essere di 11 cifre"),
  description: z.string().min(20, "Fornisci una descrizione più dettagliata"),
  type: z.enum(["AGENCY", "CREW", "COLLECTIVE", "INDIVIDUAL"]),
  cityId: z.coerce.number().min(1, "Seleziona una città dalla lista"),
});

export default function RegisterProfile() {
  const navigate = useNavigate();
  const { registrationData, clearRegistrationData } = useAuthStore();
  
  // Stato per la ricerca città
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Effetto per cercare le città dal backend
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2 && !selectedCity) {
        setIsSearching(true);
        try {
          // Nota: In produzione useremo l'indirizzo del Gateway
          const response = await fetch(`http://localhost:8081/cities/search?name=${citySearch}`);
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error("Errore nel recupero città:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearch, selectedCity]);

  // Se non ci sono dati dal primo step, torna indietro
  if (!registrationData) {
    return <Navigate to="/register" replace />;
  }

  const role = registrationData.role;
  const currentSchema = role === "ARTIST" ? artistSchema : role === "DIRECTOR" ? venueSchema : promoterSchema;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      negotiable: false,
    }
  });

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCitySearch(city.name);
    setValue("cityId", city.id, { shouldValidate: true });
    setCities([]);
  };

  const onSubmit = async (profileData) => {
    const finalData = {
      ...registrationData,
      profile: profileData
    };
    
    console.log("Registrazione Finale:", finalData);
    
    // Qui andrà la chiamata POST al backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert("Profilo creato con successo! Benvenuto in EasyGIG.");
    clearRegistrationData();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Completa il tuo Profilo</h1>
            <p className="text-slate-400">Personalizza la tua presenza come <span className="text-easygig-accent font-bold uppercase">{role}</span></p>
          </div>
          <div className="bg-easygig-accent/10 p-3 rounded-2xl">
            {role === "ARTIST" ? <Music className="text-easygig-accent" /> : role === "DIRECTOR" ? <Landmark className="text-easygig-accent" /> : <Users className="text-easygig-accent" />}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* CAMPO NOME (Comune a tutti) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              {role === "ARTIST" ? "Nome Band / Nome d'Arte" : role === "DIRECTOR" ? "Nome del Locale" : "Nome Organizzazione"}
            </label>
            <input
              {...register("name")}
              className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
              placeholder={role === "ARTIST" ? "Es. The Rockers" : "Es. Blue Note"}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* CAMPI SPECIFICI PER ARTISTA */}
          {role === "ARTIST" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <DollarSign size={16} /> Cachet Base (€)
                </label>
                <input
                  type="number"
                  {...register("cachet")}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none"
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tipo di Band</label>
                <select {...register("bandType")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none appearance-none">
                  <option value="ORIGINAL">Musica Originale</option>
                  <option value="TRIBUTE">Tribute / Cover Band</option>
                  <option value="BOTH">Entrambi</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-3 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                <input type="checkbox" {...register("negotiable")} className="w-5 h-5 rounded accent-easygig-accent" />
                <span className="text-sm text-slate-400">Il mio cachet è trattabile in base all'evento</span>
              </div>
            </div>
          )}

          {/* CAMPI SPECIFICI PER LOCALE (DIRECTOR) */}
          {role === "DIRECTOR" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Phone size={16} /> Telefono Contatto
                </label>
                <input {...register("phone")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none" placeholder="+39 ..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users size={16} /> Capienza Massima
                </label>
                <input type="number" {...register("capacity")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none" placeholder="150" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-300">Tipo di Posti</label>
                <select {...register("type")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none appearance-none">
                  <option value="STANDING">Solo in piedi</option>
                  <option value="SEATED">Solo seduti</option>
                  <option value="TABLES">Tavoli (Cena/Concerto)</option>
                  <option value="MIXED">Misto</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Info size={16} /> Attrezzatura Tecnica (Audio/Luci)
                </label>
                <textarea {...register("equipment")} rows="3" className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none" placeholder="Es: PA System, 2 monitor, mixer 16 canali..."></textarea>
              </div>
            </div>
          )}

          {/* CAMPI SPECIFICI PER PROMOTER */}
          {role === "PROMOTER" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Partita IVA</label>
                  <input {...register("partitaIva")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none" placeholder="11 cifre" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Tipo Organizzazione</label>
                  <select {...register("type")} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none appearance-none">
                    <option value="AGENCY">Agenzia di Booking</option>
                    <option value="CREW">Crew / Collettivo</option>
                    <option value="INDIVIDUAL">Libero Professionista</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 italic">Descrivi la tua attività ed esperienza</label>
                <textarea {...register("description")} rows="4" className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 outline-none" placeholder="Parlaci dei tuoi eventi passati..."></textarea>
              </div>
            </div>
          )}

          {/* CITTA (Pescata dal Backend) */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin size={16} /> Città di Riferimento
            </label>
            <div className="relative">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  if (selectedCity) setSelectedCity(null);
                }}
                className={`w-full bg-slate-800/50 border ${errors.cityId ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 outline-none transition-all`}
                placeholder="Cerca la tua città (es. Roma, Milano...)"
              />
              <div className="absolute right-4 top-3 text-slate-500">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
              </div>
            </div>

            {/* Risultati della ricerca */}
            {cities.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-3 hover:bg-easygig-accent/20 transition-colors border-b border-white/5 last:border-none"
                  >
                    <span className="font-medium text-white">{city.name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId.message}</p>}
            
            <input type="hidden" {...register("cityId")} />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="flex-1 px-6 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} /> Indietro
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? "Completamento..." : "Finalizza Registrazione"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
