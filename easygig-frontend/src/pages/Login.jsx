import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as authApi from "../api/auth";
import { useState } from "react";

// Schema di validazione
const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "La password è obbligatoria"),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      const response = await authApi.login(data);
      
      // Salva token e utente nello store globale e localStorage
      setAuth(response.user, response.token);
      
      // Navigazione intelligente alla Dashboard in base al ruolo
      const role = response.user.role;
      if (role === "ARTIST") navigate("/dashboard/artist");
      else if (role === "DIRECTOR") navigate("/dashboard/director");
      else if (role === "PROMOTER") navigate("/dashboard/promoter");
      else navigate("/"); 
    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.status === 503) {
        setError("I servizi si stanno avviando. Attendi 30 secondi e riprova.");
      } else {
        setError(err.response?.data?.message || "Credenziali non valide. Riprova.");
      }
    }

  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-white font-sans">
      {/* Glow decorativo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-easygig-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="bg-easygig-accent p-2 rounded-xl group-hover:rotate-12 transition-all">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">EasyGIG</span>
          </Link>
          <h1 className="text-3xl font-bold">Bentornato!</h1>
          <p className="text-slate-400 mt-2">Accedi per gestire i tuoi eventi e la tua musica.</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                  placeholder="mario.rossi@esempio.it"
                  autoComplete="username"
                />

              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs text-easygig-accent hover:underline">
                  Password dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  {...register("password")}
                  type="password"
                  className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Bottone Accedi */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Accedi
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              Non hai ancora un account?{" "}
              <Link to="/register" className="text-easygig-accent font-bold hover:underline italic">
                Registrati gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
