import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  LogIn,
  Mail,
  Moon,
  Sun,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type AuthPageProps = {
  initialMode: 'login' | 'register';
  onBack: () => void;
};

const AUTH_HERO_IMAGE =
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85';

const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onBack }) => {
  const { login, register } = useAuth();
  const { setTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('vous@samabudget.app');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  React.useEffect(() => {
    const update = () => setDarkMode(document.documentElement.classList.contains('dark'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleColorMode = () => {
    const dark = document.documentElement.classList.contains('dark');
    setTheme(dark ? 'light' : 'dark');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      login(email, password);
      setLoading(false);
    }, 280);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const result = register(email, password, confirm, { firstName, lastName });
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 280);
  };

  const inputShell =
    'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500';

  const inputPlain =
    'w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500';

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0c0f14]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Aside — présentation (image différente de la landing) */}
        <aside
          className="relative order-1 flex min-h-[min(280px,42vh)] flex-col justify-between overflow-hidden lg:order-none lg:min-h-screen lg:w-[min(100%,440px)] lg:max-w-[42vw] lg:shrink-0 xl:max-w-[480px]"
          aria-label="Présentation"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${AUTH_HERO_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/88 via-slate-900/75 to-emerald-950/80" />

          <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10">
            <div className="login-graphic-top">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Retour à l’accueil
              </button>
            </div>

            <div className="login-graphic-content mt-8 flex flex-1 flex-col justify-center lg:mt-0">
              <p className="login-logo flex items-center gap-2 text-lg font-bold text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Wallet className="h-6 w-6 text-emerald-300" aria-hidden />
                </span>
                <span>
                  Sama<span className="text-emerald-400">Budget</span>
                </span>
              </p>
              <h2 className="mt-6 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Pilotez votre argent avec clarté.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200/90 sm:text-base">
                Accédez à votre tableau de bord : transactions en F&nbsp;CFA, épargne, défis, statistiques, tontine et
                notifications — l’essentiel de votre suivi financier au même endroit.
              </p>
            </div>

            <p className="login-graphic-copy mt-8 text-xs font-medium text-white/60 lg:mt-0">
              © {new Date().getFullYear()} SamaBudget
            </p>
          </div>
        </aside>

        {/* Formulaire */}
        <div className="relative order-2 flex flex-1 flex-col bg-[#f6f7f9] dark:bg-[#0c0f14]">
          <button
            type="button"
            onClick={toggleColorMode}
            className="login-theme-toggle absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:right-8 sm:top-8"
            aria-label="Basculer le thème clair ou sombre"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="login-form-wrapper flex max-h-[100dvh] flex-1 flex-col justify-center overflow-y-auto px-5 py-12 sm:px-10 lg:max-h-none lg:px-14 xl:px-20">
            <div className="mx-auto w-full max-w-md">
              {/* Onglets Connexion / Inscription */}
              <div className="mb-8 flex rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                    mode === 'login'
                      ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                    mode === 'register'
                      ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Inscription
                </button>
              </div>

              <header className="login-header">
                {mode === 'login' ? (
                  <>
                    <h1 className="login-title text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      Content de vous revoir{' '}
                      <span className="login-wave inline-block" aria-hidden>
                        👋
                      </span>
                    </h1>
                    <p className="login-subtitle mt-2 text-slate-600 dark:text-slate-400">
                      Saisissez vos identifiants pour continuer.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="login-title text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      Créez votre espace{' '}
                      <span className="login-wave inline-block" aria-hidden>
                        ✨
                      </span>
                    </h1>
                    <p className="login-subtitle mt-2 text-slate-600 dark:text-slate-400">
                      Quelques informations suffisent pour créer votre espace personnel.
                    </p>
                  </>
                )}
              </header>

              <div
                className="login-demo mt-6 rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300"
                role="note"
              >
                {mode === 'login' ? (
                  <>
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">Sécurité &amp; accès</strong>
                    <p className="mt-1 leading-relaxed">
                      Utilisez l’adresse e-mail et le mot de passe de votre compte. Vos données budgétaires sont associées à cette
                      session sur cet appareil. Pensez à choisir un mot de passe robuste ; la réinitialisation par e-mail sera
                      ajoutée lors du branchement du service d’authentification en ligne.
                    </p>
                  </>
                ) : (
                  <>
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">Profil</strong>
                    <p className="mt-1 leading-relaxed">
                      Prénom, nom, e-mail et mot de passe suffisent pour commencer. Vous pourrez compléter téléphone, adresse,
                      photo et autres informations dans <span className="font-medium">Infos personnelles</span> après votre
                      première connexion.
                    </p>
                  </>
                )}
              </div>

              {error && (
                <p
                  className="login-error mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {mode === 'login' ? (
                <form className="login-form mt-8 space-y-5" onSubmit={handleLogin} autoComplete="on" noValidate>
                  <div className="form-group space-y-2">
                    <label htmlFor="auth-email" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Adresse e-mail
                    </label>
                    <div className="input-icon-wrapper relative">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="auth-email"
                        type="email"
                        name="email"
                        className={inputShell}
                        placeholder="vous@samabudget.app"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="form-group space-y-2">
                    <label htmlFor="auth-password" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Mot de passe
                    </label>
                    <div className="input-icon-wrapper relative">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="auth-password"
                        type="password"
                        name="password"
                        className={inputShell}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="form-options flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="remember-me flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                      />
                      <span>Se souvenir de moi</span>
                    </label>
                    <button
                      type="button"
                      className="forgot-pwd font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      onClick={() => {
                        /* démo : pas de flux réel */
                      }}
                    >
                      Mot de passe oublié&nbsp;?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-submit flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Se connecter
                        <LogIn className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form className="login-form mt-8 space-y-5" onSubmit={handleRegister} autoComplete="on" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="form-group space-y-2">
                      <label htmlFor="reg-first" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-first"
                        type="text"
                        name="firstName"
                        className={inputPlain}
                        placeholder="Moussa"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="form-group space-y-2">
                      <label htmlFor="reg-last" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-last"
                        type="text"
                        name="lastName"
                        className={inputPlain}
                        placeholder="Diop"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="form-group space-y-2">
                    <label htmlFor="reg-email" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Adresse e-mail
                    </label>
                    <div className="input-icon-wrapper relative">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="reg-email"
                        type="email"
                        name="email"
                        className={inputShell}
                        placeholder="vous@samabudget.app"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group space-y-2">
                    <label htmlFor="reg-password" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Mot de passe
                    </label>
                    <div className="input-icon-wrapper relative">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="reg-password"
                        type="password"
                        name="password"
                        className={inputShell}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="form-group space-y-2">
                    <label htmlFor="reg-confirm" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Confirmer le mot de passe
                    </label>
                    <div className="input-icon-wrapper relative">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="reg-confirm"
                        type="password"
                        name="confirm"
                        className={inputShell}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-submit flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Créer mon compte
                        <UserPlus className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="login-footer mt-10 text-center text-sm text-slate-500 dark:text-slate-500">
                Problème de connexion&nbsp;?{' '}
                <button type="button" onClick={onBack} className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                  Revenir à l’accueil
                </button>
                {' · '}
                <span className="text-slate-400">Centre d’aide disponible après connexion dans l’app.</span>
              </p>

              <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
                Vos données budgétaires sont enregistrées sur cet appareil. Une synchronisation sécurisée entre appareils pourra
                être proposée dans une prochaine version du service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
