import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, Lock, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import api from '../api/axios';

const resetPasswordSchema = z.object({
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      setStatus({ type: 'error', text: 'Token mancante. Usa il link inviato via email.' });
      return;
    }
    try {
      await api.post(`/auth/reset-password?token=${token}&newPassword=${data.password}`);
      setStatus({ type: 'success', text: 'Password aggiornata con successo!' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus({ type: 'error', text: 'Token scaduto o non valido. Riprova la procedura.' });
    }
  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 group">
            <div className="bg-easygig-accent p-2 rounded-xl">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">EasyGIG</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          {status.type === 'success' ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Password Aggiornata!</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                La tua password è stata resettata correttamente. Verrai reindirizzato al login tra pochi istanti...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nuova Password</h1>
                <p className="text-slate-400">Inserisci la tua nuova password di accesso.</p>
              </div>

              {status.text && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertTriangle size={18} />
                  <p>{status.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nuova Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Conferma Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-premium text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salva Nuova Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
