import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Menu,
  Moon,
  PiggyBank,
  Play,
  Smartphone,
  Star,
  Sun,
  Trophy,
  Wallet,
  X,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type LandingProps = {
  onLogin: () => void;
  onRegister: () => void;
};

const containerClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

const Landing: React.FC<LandingProps> = ({ onLogin, onRegister }) => {
  const { setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleColorMode = () => {
    const dark = document.documentElement.classList.contains('dark');
    setTheme(dark ? 'light' : 'dark');
  };

  const [darkMode, setDarkMode] = useState(false);
  React.useEffect(() => {
    const update = () => setDarkMode(document.documentElement.classList.contains('dark'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const audience = [
    'Familles',
    'Freelances',
    'Étudiants',
    'TPE & indépendants',
    'Diaspora UEMOA',
    'Familles',
    'Freelances',
    'Étudiants',
    'TPE & indépendants',
    'Diaspora UEMOA',
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#0c0f14] dark:text-slate-100">
      {/* Nav — structure type EduManage */}
      <nav
        className={`sticky top-0 z-[100] border-b transition-shadow duration-300 ${
          navScrolled
            ? 'border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90'
            : 'border-transparent bg-[#f6f7f9]/90 backdrop-blur-sm dark:bg-[#0c0f14]/90'
        }`}
        aria-label="Navigation principale"
      >
        <div className={`${containerClass} flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]`}>
          <a
            href="#"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/20">
              <Wallet className="h-5 w-5" aria-hidden />
            </span>
            <span>
              Sama<span className="text-emerald-600 dark:text-emerald-400">Budget</span>
            </span>
          </a>

          <ul className="hidden items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 lg:flex">
            <li>
              <a href="#features" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
                Fonctionnalités
              </a>
            </li>
            <li>
              <a href="#donnees" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
                Données &amp; confidentialité
              </a>
            </li>
            <li>
              <a href="#parcours" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
                Parcours
              </a>
            </li>
            <li>
              <a href="#cta" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
                Accès
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleColorMode}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Basculer le thème clair ou sombre"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="hidden rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-block"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 sm:inline-flex sm:items-center sm:gap-2"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            <ul className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <li>
                <a href="#features" className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={closeMobile}>
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#donnees" className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={closeMobile}>
                  Données &amp; confidentialité
                </a>
              </li>
              <li>
                <a href="#parcours" className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={closeMobile}>
                  Parcours
                </a>
              </li>
              <li>
                <a href="#cta" className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={closeMobile}>
                  Accès
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  onLogin();
                }}
                className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold dark:border-slate-600"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  onRegister();
                }}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md"
              >
                Commencer gratuitement
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f6f7f9] py-14 dark:border-slate-800/80 dark:from-slate-950 dark:to-[#0c0f14] sm:py-20 lg:py-24" aria-labelledby="hero-title">
          <div className={`${containerClass} grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10`}>
            <div className="hero-text max-w-xl lg:max-w-none">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-600 dark:text-amber-300" aria-hidden />
                Conçu pour le Sénégal &amp; l’Afrique francophone — montants en F&nbsp;CFA
              </p>
              <h1 id="hero-title" className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Pilotez votre budget personnel{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                  avec clarté
                </span>
                .
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Tableau de bord, transactions en F&nbsp;CFA, objectifs d’épargne, défis, statistiques, tontine, notifications et
                paramètres — tout dans une interface web claire et responsive. Vous gardez la maîtrise : saisie manuelle des
                montants, sans obligation de lier un compte bancaire ou un opérateur mobile.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onRegister}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 sm:px-7 sm:text-base"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:text-base"
                >
                  <Play className="h-4 w-4 text-emerald-600" aria-hidden />
                  Voir les fonctionnalités
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <div className="relative rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                    alt="Aperçu type tableau de bord financier"
                    width={800}
                    height={520}
                    className="h-auto w-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
              {/* Floating cards */}
              <div
                className="absolute -left-2 top-[18%] z-10 flex max-w-[220px] items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xl dark:border-slate-600 dark:bg-slate-800 sm:left-[-8%]"
                aria-hidden
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Revenus</h4>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Montants saisis en F&nbsp;CFA
                  </p>
                </div>
              </div>
              <div
                className="absolute -right-2 bottom-[12%] z-10 flex max-w-[220px] items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xl dark:border-slate-600 dark:bg-slate-800 sm:right-[-6%]"
                aria-hidden
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Défis</h4>
                  <p className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                    Libellés et objectifs à définir par vous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bandeau confiance — réalités cibles, pas logos fictifs d’écoles */}
        <section className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800/80 dark:bg-slate-950" aria-label="Publics visés">
          <div className={containerClass}>
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pensé pour ceux qui gèrent un budget en zone CFA
            </p>
            <div className="relative mt-6 overflow-hidden">
              <div className="landing-marquee-track gap-12 pr-12">
                {[...audience, ...audience].map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className="shrink-0 text-lg font-bold text-slate-400/90 dark:text-slate-500"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités — aligné sur les modules du code */}
        <section id="features" className="scroll-mt-20 py-16 sm:py-20 lg:py-24" aria-labelledby="features-title">
          <div className={containerClass}>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="features-title"
                className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400"
              >
                Tout ce dont vous avez besoin, au même endroit.
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Fini les tableurs éparpillés : transactions, épargne, défis et indicateurs sont réunis dans un seul tableau de
                bord, avec des vues dédiées pour suivre le détail au quotidien.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                  <BookOpen className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transactions &amp; solde</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Enregistrez revenus et dépenses, consultez l’historique et le solde mis à jour automatiquement à partir de vos
                  saisies — au cœur de votre suivi quotidien.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                  <PiggyBank className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Épargne &amp; objectifs</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Définissez plusieurs objectifs en F&nbsp;CFA, suivez la progression et gardez le cap sur vos priorités.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  <Trophy className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Défis, stats &amp; communauté</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Défis pour rester motivé, graphiques pour comprendre vos habitudes, tontine et notifications pour ne rien
                  manquer — l’ensemble reste utilisable sur votre appareil, même sans connexion permanente.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Parcours — reflète la sidebar réelle */}
        <section id="parcours" className="scroll-mt-20 border-y border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-slate-950 sm:py-20">
          <div className={containerClass}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Parcours dans l’application</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Une navigation simple : chaque section correspond à une étape concrète de votre gestion financière.
              </p>
            </div>
            <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Tableau de bord', body: 'Vue d’ensemble : soldes, raccourcis et dernières opérations.' },
                { step: '2', title: 'Transactions', body: 'Saisie et liste des mouvements qui alimentent les calculs.' },
                { step: '3', title: 'Épargne & stats', body: 'Objectifs d’épargne et graphiques dans Statistiques.' },
                { step: '4', title: 'Défis & plus', body: 'Défis, profil, tontine, notifications, aide et réglages.' },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-slate-200/90 bg-[#f6f7f9] p-5 dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Confidentialité & montants CFA */}
        <section id="donnees" className="scroll-mt-20 py-16 sm:py-20 lg:py-24" aria-labelledby="donnees-title">
          <div className={`${containerClass} grid items-center gap-10 lg:grid-cols-2 lg:gap-14`}>
            <div className="order-2 overflow-hidden rounded-2xl border border-slate-200/90 shadow-lg dark:border-slate-700 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80"
                alt="Suivi de budget et planification"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Smartphone className="h-6 w-6" aria-hidden />
              </div>
              <h2 id="donnees-title" className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Vos montants en F&nbsp;CFA, la confidentialité avant tout.
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Vos opérations et paramètres sont enregistrés sur <strong className="font-semibold text-slate-800 dark:text-slate-200">votre appareil</strong>, ce qui
                limite la circulation de vos données financières et permet un usage fluide au quotidien. La création de compte
                et la connexion pourront être reliées à nos serveurs lorsque la synchronisation et l’authentification renforcée
                seront activées — sans changer l’expérience que vous voyez aujourd’hui sur l’interface.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>Interface pensée pour le franc CFA : soldes, listes et objectifs dans la même unité.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>Vous saisissez vous-même revenus et dépenses : aucune connexion obligatoire à une banque ou à un opérateur mobile pour commencer.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>Thème clair, sombre ou automatique selon votre système.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>Roadmap ouverte : sauvegarde cloud, multi-appareils et intégrations paiement lorsque vous serez prêt à les activer.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="scroll-mt-20 pb-20 pt-4 sm:pb-24" aria-labelledby="cta-title">
          <div className={containerClass}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 py-14 text-center text-white shadow-2xl sm:px-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative">
                <h2 id="cta-title" className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                  Prêt à structurer votre budget&nbsp;?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                  Ouvrez un compte en quelques secondes, accédez au tableau de bord et utilisez l’ensemble des outils :
                  transactions, épargne, défis, tontine et notifications.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onRegister}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-slate-100 sm:text-base"
                  >
                    Commencer gratuitement
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/15 sm:text-base"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className={`${containerClass} py-14`}>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Wallet className="h-4 w-4" aria-hidden />
                </span>
                Sama<span className="text-emerald-600 dark:text-emerald-400">Budget</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Application web de budget personnel pour suivre revenus, dépenses et épargne en F&nbsp;CFA, avec une expérience
                moderne et responsive.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Produit</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#parcours" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Parcours
                  </a>
                </li>
                <li>
                  <a href="#donnees" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Données &amp; confidentialité
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Conditions d’utilisation
                  </a>
                </li>
                <li>
                  <a href="#cta" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    Accès
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dans l’app</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Tableau de bord</li>
                <li>Transactions &amp; épargne</li>
                <li>Statistiques &amp; défis</li>
                <li>Profil, tontine, aide</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Évolution</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Stockage actuel sur votre appareil</li>
                <li>Synchronisation &amp; compte cloud à venir</li>
                <li>API et intégrations selon la feuille de route</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500">
            <p>© {new Date().getFullYear()} SamaBudget. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
