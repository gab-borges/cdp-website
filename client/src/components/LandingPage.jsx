// src/components/LandingPage.jsx
import React from "react";
import { ArrowRight, Trophy, Users, BarChart3, CalendarDays, Code2, ChevronRight, Github, BookOpen, MessageSquareHeart } from "lucide-react";
import logo from "../assets/logo-cdp.jpg";
import "./landing.css";

export default function LandingPage({ onShowLogin, onShowSignUp }) {
  return (
    <div className="lp-root">
      {/* Navbar */}
      <header className="lp-navbar">
        <div className="lp-container lp-navwrap">
          <a href="#top" className="lp-brand">
            <img src={logo} alt="Clube de Programação UTFPR" className="lp-logo" />
            <span>Clube de Programação • UTFPR-CT</span>
          </a>
          <nav className="lp-nav">
            <a href="#features">Recursos</a>
            <a href="#leaderboard">Leaderboard</a>
            <a href="#faq">FAQ</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-linkicon">
              <Github size={16} /> GitHub
            </a>
          </nav>
          <div className="lp-actions">
            <button className="lp-btn lp-btn-ghost" onClick={onShowLogin}>Entrar</button>
            <button className="lp-btn" onClick={onShowSignUp}>
              Criar conta <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero" id="top">
        <div className="lp-gridbg" aria-hidden />
        <div className="lp-container lp-hero-inner">
          <h1 className="lp-h1">Clube de Programação</h1>
          <p className="lp-sub">O hub oficial do CDP da UTFPR. Organize treinos, acompanhe rankings e evolua.</p>
          <div className="lp-cta">
            <button className="lp-btn" onClick={onShowSignUp}>
              Começar agora <ArrowRight size={16} />
            </button>
            <a href="#features" className="lp-btn lp-btn-outline">Ver recursos</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-h2">Funcionalidades</h2>
            <p className="lp-muted">Centraliza treinos, materiais e seu progresso</p>
          </div>
          <div className="lp-features">
            <Feature icon={<Trophy size={20} />} title="Competições" desc="Agendamento de treinos e contests com calendário integrado." />
            <Feature icon={<BarChart3 size={20} />} title="Leaderboards" desc="Ranking individual e por equipe com pontuação unificada." />
            <Feature icon={<Code2 size={20} />} title="Agregador de Judges" desc="Integração leve com Codeforces, AtCoder, BeeCrowd, etc." />
            <Feature icon={<Users size={20} />} title="Perfis & Times" desc="Histórico, times, badges e metas semanais." />
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="lp-section lp-section-alt">
        <div className="lp-container lp-leader-wrap">
          <div className="lp-leader-col">
            <h3 className="lp-h3">Leaderboard ao vivo</h3>
            <p className="lp-muted">Pontos calculados a partir de múltiplos juízes, normalizados por dificuldade e tempo. Transparente e auditável.</p>
            <div className="lp-card">
              <div className="lp-table-head">
                <div>#</div>
                <div>Membro</div>
                <div className="lp-right">Pontos</div>
              </div>
              <div className="lp-divider" />
              {[{rank:1,name:"Ana Silva",points:1840},{rank:2,name:"João Pereira",points:1765},{rank:3,name:"Mariana Souza",points:1690},{rank:4,name:"Carlos Lima",points:1580},{rank:5,name:"Rafa Andrade",points:1525}] .map(r => (
                <div key={r.rank} className="lp-row">
                  <div className="lp-strong">#{r.rank}</div>
                  <div className="lp-truncate">{r.name}</div>
                  <div className="lp-right lp-mono">{r.points} pts</div>
                </div>
              ))}
            </div>
            <div className="lp-row-actions">
              <a className="lp-btn" href="/leaderboard">Ver completa</a>
              <a className="lp-btn lp-btn-outline" href="/docs/scoring">Como pontuamos</a>
            </div>
          </div>
          <div className="lp-leader-col">
            <div className="lp-grid2">
              <SmallCard title="Eventos & Treinos" desc="Planeje encontros semanais, maratonas e simulados com lembretes." />
              <SmallCard title="Materiais & Guias" desc="Curadoria de editoriais, roadmaps e listas por tópico." />
              <SmallCard title="Integrações" desc="Conecte Codeforces/AtCoder e sincronize progresso." />
              <SmallCard title="Comunidade" desc="Mentorias, grupos de estudo e Discord." />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section">
        <div className="lp-container lp-faq">
          <h3 className="lp-h3">Perguntas frequentes</h3>
          <details>
            <summary>O que preciso saber para começar?</summary>
            <p>Nenhum pré-requisito é necessário, mas recomenda-se ter conhecimento em alguma linguagem de programação como C, C++, Python ou Java</p>
          </details>
          <details>
            <summary>Preciso ser da UTFPR-CT para participar?</summary>
            <p>A inscrição e a participação nas atividades do Clube são totalmente gratuitas e abertas a todas as pessoas interessadas! (Estudantes da UTFPR-CT ou de outras instituições, ou profissionais da área)</p>
          </details>
          <details>
            <summary>Como funcionam os pontos do ranking?</summary>
            <p>A pontuação é normalizada por dificuldade, tempo e penalidades.</p>
          </details>
          <details>
            <summary>Vocês têm juiz próprio?</summary>
            <p>Não. O nosso "juiz" é simplesmente um agregador de outros judges.</p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footwrap">
          <div className="lp-footbrand">
            <img src={logo} alt="Clube de Programação UTFPR" className="lp-logo" />
            <span>© {new Date().getFullYear()} Clube de Programação • UTFPR Curitiba</span>
          </div>
          <nav className="lp-footnav">
            <a href="/about">Sobre</a>
            <a href="/events">Eventos</a>
            <a href="/contact">Contato</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }){
  return (
    <div className="lp-feature">
      <div className="lp-feature-icon">{icon}</div>
      <div className="lp-feature-title">{title}</div>
      <div className="lp-feature-desc">{desc}</div>
    </div>
  );
}

function SmallCard({ title, desc }){
  return (
    <div className="lp-card lp-card-small">
      <div className="lp-card-title">{title}</div>
      <div className="lp-card-desc">{desc}</div>
    </div>
  );
}

function Badge({ icon, title }){
  return (
    <div className="lp-badge">
      <div className="lp-badge-icon">{icon}</div>
      <div className="lp-badge-title">{title}</div>
    </div>
  );
}
