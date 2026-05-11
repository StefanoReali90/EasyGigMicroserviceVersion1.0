import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from '../api/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
});

export default function ForgotPassword() {
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post(`/auth/forgot-password?email=${data.email}`);
      setIsSent(true);
    } catch (error) {
      alert("Errore durante la richiesta di recupero. Verifica l'email inserita.");
    }
  };

  return (
    <div className="min-h-screen bg-easygig-dark flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full relative">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="bg-easygig-accent p-2 rounded-xl group-hover:rotate-12 transition-all">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">EasyGIG</span>
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          {!isSent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Recupera Password</h1>
                <p className="text-slate-400">Inserisci la tua email e ti invieremo le istruzioni per reimpostare la tua password.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                      {...register("email")}
                      type="email"
                      className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-easygig-accent outline-none transition-all`}
                      placeholder="mario.rossi@esempio.it"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Invia Link di Recupero
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <div className="bg-easygig-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-easygig-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Email Inviata!</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Controlla la tua casella di posta. Ti abbiamo inviato un link sicuro per reimpostare la tua password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-easygig-accent font-bold hover:underline"
              >
                <ArrowLeft size={18} /> Torna al Login
              </Link>
            </div>
          )}

          {!isSent && (
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} /> Torna al login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
