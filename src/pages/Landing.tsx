import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 text-white font-bold flex items-center justify-center">E</div>
            <span className="font-semibold">Exelaki</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-white">Features</a>
            <a href="#how" className="hover:text-neutral-900 dark:hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-neutral-900 dark:hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => login({ screen_hint: 'login' })} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700">Log in</button>
            <button onClick={() => login({ screen_hint: 'signup' })} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">Get started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Take control of your money with clarity
              </h1>
              <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
                Exelaki helps you plan budgets, track expenses, and project your future — across devices, beautifully.
              </p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => login({ screen_hint: 'signup' })} className="px-5 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700">Create free account</button>
                <a href="#features" className="px-5 py-3 rounded-md border border-neutral-300 dark:border-neutral-700">See features</a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/60 dark:bg-neutral-900/60 p-4">
                <div className="h-72 sm:h-96 rounded-md bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center text-neutral-500">
                  App preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-neutral-50 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Everything you need to budget better</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">Designed with a modern, mobile‑first UX and powerful analytics.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Smart dashboard","Flexible categories","Powerful projections","Mobile friendly","Tag based insights","Secure by design"].map((t, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900/60">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 flex items-center justify-center font-semibold">{i+1}</div>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris placerat sapien at massa facilisis.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {["Create your plan","Track and tag","Project outcomes"].map((t, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="text-sm text-primary-600">Step {i+1}</div>
                <h3 className="mt-2 font-semibold text-lg">{t}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Curate categories, add entries, and visualize your path forward.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-neutral-50 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Simple pricing</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">Start free. Upgrade when you grow.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900/60">
              <h3 className="font-semibold">Free</h3>
              <p className="text-3xl font-extrabold mt-2">€0</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li>Up to 3 categories</li>
                <li>Basic charts</li>
                <li>Community support</li>
              </ul>
              <Link to="/signup" className="mt-6 inline-block px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Get started</Link>
            </div>
            <div className="rounded-xl border border-primary-300 dark:border-primary-700 p-6 bg-primary-50/60 dark:bg-primary-900/20">
              <h3 className="font-semibold">Pro</h3>
              <p className="text-3xl font-extrabold mt-2">€4.99<span className="text-base font-medium">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                <li>Unlimited categories</li>
                <li>Advanced projections</li>
                <li>Priority support</li>
              </ul>
              <Link to="/signup" className="mt-6 inline-block px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Upgrade</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center">Frequently asked questions</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                <h3 className="font-semibold">How does Exelaki keep my data safe?</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">We follow best practices for authentication and storage. Your data is protected in transit and at rest.</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/signup" className="px-5 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700">Start budgeting today</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Exelaki</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-800 dark:hover:text-neutral-200">Privacy</a>
            <a href="#" className="hover:text-neutral-800 dark:hover:text-neutral-200">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


