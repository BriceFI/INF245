import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isResetting) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/#/',
        });
        if (error) throw error;
        setError("Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.");
        setIsResetting(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // 1. Inscription Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // 2. Extraction du prénom et nom depuis prenom.nom@viacesi.fr
        if (authData?.user) {
          const emailPrefix = email.split('@')[0];
          const nameParts = emailPrefix.split('.');
          
          const firstName = nameParts[0] 
            ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase() 
            : 'Inconnu';
            
          const lastName = nameParts[1] 
            ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase() 
            : '';

          // 3. Insertion directe dans la table (Simple et sans trigger)
          const { error: dbError } = await supabase.from('companies').insert([
            {
              user_id: authData.user.id,
              email: email,
              company_name: companyName,
              first_name: firstName,
              last_name: lastName,
              balance: 1000000,
              is_admin: false
            }
          ]);
          
          if (dbError) {
            console.error("Erreur insertion:", dbError);
            throw new Error("Erreur lors de la création du profil. Contactez l'administrateur.");
          }
        }
        
        setError("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-beige-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-beige-200 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-100 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-terracotta-50 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="mb-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-terracotta-50 text-terracotta-600 mb-6 shadow-sm border border-terracotta-100">
            <Briefcase size={36} />
          </div>
          <h1 className="text-sm font-bold tracking-[0.2em] text-terracotta-700 uppercase mb-2">
            Supervision du portefeuille projets
          </h1>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {isResetting ? 'Réinitialisation' : isLogin ? 'Bienvenue' : 'Créer votre entité'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5 relative z-10">
          {!isLogin && !isResetting && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 ml-1">Nom de l'entité</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Briefcase size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-beige-50 border border-beige-200 rounded-2xl focus:ring-2 focus:ring-terracotta-500 focus:border-transparent text-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="Ex: Direction Innovation"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 ml-1">Email académique</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-beige-50 border border-beige-200 rounded-2xl focus:ring-2 focus:ring-terracotta-500 focus:border-transparent text-neutral-900 transition-all placeholder:text-neutral-400"
                placeholder="prenom.nom@viacesi.fr"
              />
            </div>
          </div>

          {!isResetting && (
            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Mot de passe</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-xs font-bold text-terracotta-600 hover:text-terracotta-500 transition-colors underline decoration-terracotta-200 underline-offset-4"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-beige-50 border border-beige-200 rounded-2xl focus:ring-2 focus:ring-terracotta-500 focus:border-transparent text-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 px-6 rounded-2xl shadow-lg shadow-terracotta-500/20 text-sm font-bold text-white bg-terracotta-600 hover:bg-terracotta-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isResetting ? (
              <>
                <Mail size={18} className="mr-3" /> Envoyer le lien
              </>
            ) : isLogin ? (
              <>
                <LogIn size={18} className="mr-3" /> Se connecter
              </>
            ) : (
              <>
                <UserPlus size={18} className="mr-3" /> Créer mon entité
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3 relative z-10">
          {!isResetting ? (
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-neutral-500 hover:text-terracotta-600 transition-colors"
            >
              {isLogin
                ? "Nouvel utilisateur ? Créez une entité"
                : 'Déjà inscrit ? Retour à la connexion'}
            </button>
          ) : (
            <button
              onClick={() => setIsResetting(false)}
              className="text-sm font-medium text-neutral-500 hover:text-terracotta-600 transition-colors"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
