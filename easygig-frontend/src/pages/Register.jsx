import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

// Schema di validazione con Zod (standard professionale)
const registerSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  role: z.enum(["ARTIST", "PROMOTER", "DIRECTOR"], {
    errorMap: () => ({ message: "Seleziona un ruolo valido" }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Devi accettare l'informativa sulla privacy" }),
  }),
});

export default function Register() {
  const navigate = useNavigate();
  const setRegistrationData = useAuthStore((state) => state.setRegistrationData);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "ARTIST",
    }
  });

  const onSubmit = async (data) => {
    setRegistrationData(data);
    navigate("/register-profile");
  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* --- LATO SINISTRO: BRANDING & INFO --- */}
        <div className="hidden md:block space-y-8">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Music className="w-8 h-8 text-easygig-accent" />
            <span className="text-3xl font-black tracking-tighter">EasyGIG</span>
          </Link>
          
          <h2 className="text-5xl font-black leading-tight">
            Unisciti alla più grande <br />
            <span className="text-easygig-accent">community musicale.</span>
          </h2>
          
          <div className="space-y-6">
            <FeatureItem title="Profili Verificati" description="Ogni utente viene controllato per garantire la massima serietà." />
            <FeatureItem title="Sistema di Reputazione" description="Punteggi basati sui feedback reali per garantire affidabilità reciproca." />
            <FeatureItem title="Comunicazione Diretta" description="Chat integrata per definire ogni dettaglio senza intermediari." />
          </div>
        </div>

        {/* --- LATO DESTRO: IL FORM --- */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Crea il tuo Account</h1>
            <p className="text-slate-400">Inizia il tuo viaggio nel mondo di EasyGIG</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    {...register("firstName")}
                    className={`w-full bg-slate-800/50 border ${errors.firstName ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                    placeholder="Mario"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>

              {/* Cognome */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Cognome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    {...register("lastName")}
                    className={`w-full bg-slate-800/50 border ${errors.lastName ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                    placeholder="Rossi"
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Aziendale o Personale</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                  placeholder="mario.rossi@esempio.it"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  {...register("password")}
                  type="password"
                  className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Ruolo (UserType) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Cosa vuoi fare su EasyGIG?</label>
              <select
                {...register("role")}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-easygig-accent outline-none appearance-none cursor-pointer"
              >
                <option value="ARTIST">Sono un Artista / Band</option>
                <option value="PROMOTER">Sono un Promoter</option>
                <option value="DIRECTOR">Gestisco un Locale (Venue)</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>

            {/* Privacy Checkbox */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("privacyAccepted")}
                  className="mt-1 w-5 h-5 rounded border-white/10 bg-slate-800 text-easygig-accent focus:ring-easygig-accent cursor-pointer transition-all"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Accetto l'informativa sulla privacy e i termini di servizio di EasyGIG per il trattamento dei dati personali.
                </span>
              </label>
              {errors.privacyAccepted && <p className="text-red-500 text-xs mt-1">{errors.privacyAccepted.message}</p>}
            </div>

            {/* Bottone di Invio */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {isSubmitting ? "Creazione Account..." : "Registrati Ora"}
              <ArrowRight className={`w-5 h-5 ${isSubmitting ? 'hidden' : 'group-hover:translate-x-1'} transition-transform`} />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-400">
            Hai già un account?{" "}
            <Link to="/login" className="text-easygig-accent font-bold hover:underline">Accedi</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-4">
      <div className="bg-easygig-accent/10 p-2 rounded-lg h-fit">
        <CheckCircle2 className="w-6 h-6 text-easygig-accent" />
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
