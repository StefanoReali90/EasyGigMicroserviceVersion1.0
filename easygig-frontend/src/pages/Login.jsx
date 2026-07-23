import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as authApi from "../api/auth";
import { useState } from "react";

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
      setAuth(response.user, response.token);
      
      const role = response.user.role;
      if (role === "ARTIST") navigate("/dashboard/artist");
      else if (role === "DIRECTOR") navigate("/dashboard/director");
      else if (role === "PROMOTER") navigate("/dashboard/promoter");
      else navigate("/"); 
    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.status === 503) {
        setError("I servizi si stanno avviando. Attendi 15 secondi e riprova.");
      } else {
        setError(err.response?.data?.message || "Credenziali non valide. Verifica email e password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background illumination */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">EasyGIG</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Accedi al tuo account</h1>
          <p className="text-slate-400 text-xs mt-1">Inserisci le tue credenziali per accedere alla dashboard</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-2xl shadow-studio">
          
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email aziendale / personale</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  className={`input-studio pl-10 w-full ${errors.email ? 'border-red-500/80 focus:ring-red-500/50' : ''}`}
                  placeholder="nome@esempio.it"
                  autoComplete="username"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                  Password dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  {...register("password")}
                  type="password"
                  className={`input-studio pl-10 w-full ${errors.password ? 'border-red-500/80 focus:ring-red-500/50' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 mt-2 text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Accedi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-xs">
              Non hai ancora un profilo?{" "}
              <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                Registrati gratuitamente
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
