// src/components/LandingPage.jsx
import React, { useEffect } from "react";
import { ArrowRight, Trophy, Users, BarChart3, CalendarDays, Code2, ChevronRight, Github, BookOpen, MessageSquareHeart } from "lucide-react";
import logo from "../assets/logo-cdp.jpg";
import "./landing.css";

export default function LandingPage({ onShowLogin, onShowSignUp }) {
  // Enable smooth scrolling for in-page anchors
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => { root.style.scrollBehavior = prev; };
  }, []);
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
            <a href="#about">Sobre</a>
            <a href="#features">Recursos</a>
            <a href="#leaderboard">Leaderboard</a>
            <a href="#faq">FAQ</a>
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
      <section className="lp-hero" id="top" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-gridbg" aria-hidden />
        <div className="lp-container lp-hero-inner">
          <h1 className="lp-h1">Clube de Programação</h1>
          <p className="lp-sub"><span className="lp-nowrap" style={{ whiteSpace: 'nowrap' }}>Um espaço para <span class="lp-kws">aprender, compartilhar e evoluir</span> em programação competitiva</span></p>
          <div className="lp-cta">
            <button className="lp-btn" onClick={onShowSignUp}>
              Começar <ArrowRight size={16} />
            </button>
            <a href="#features" className="lp-btn lp-btn-outline">Ver recursos</a>
          </div>
        </div>
      </section>

      {/* Team Photo */}
      <section id="team" className="lp-section lp-section-alt" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-container">
          <figure className="lp-photo">
            <img className="lp-photo-img" src="../../public/photo-cdp.jpg" alt="Foto dos membros do Clube de Programação da UTFPR-CT" />
            <figcaption className="lp-photo-cap lp-muted">Maratona SBC de Programação - 2024</figcaption>
          </figure>
        </div>
      </section>

      {/* About */}
      <section id="about" className="lp-section lp-section-alt" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-container lp-about-wrap">
          <div className="lp-about-text">
            <h3 className="lp-h3">Sobre o Clube</h3>
            <p>
              O Clube de Programação é um projeto de extensão do Departamento Acadêmico de Informática (DAINF) da UTFPR Curitiba, coordenado pelo professor Leandro M. Zatesko. Seu propósito central é reunir pessoas interessadas em programação — sejam estudantes da UTFPR, de outras instituições, alunos de ensino médio ou profissionais da área — para aprender, desenvolver habilidades e trocar experiências por meio da <strong>Programação Competitiva</strong>.
              Além disso, oferece um espaço de formação complementar em tópicos de Computação de grande relevância acadêmica e industrial, frequentemente pouco explorados nos cursos de graduação.
            </p>
            <p>
              O CDP também atua na organização e promoção de ações de difusão do conhecimento, como a produção de conteúdo para mídias sociais e atividades em parceria com outras instituições.
              Ele treina os times da UTFPR-CT para a Maratona de Programação da SBC (ICPC regional), fortalece a comunidade local de programadores, aproxima empresas e universidades e apoia disciplinas de programação, contribuindo para reduzir índices de reprovação e consolidar a formação prática dos participantes.
            </p>
          </div>
          <div className="lp-about-cards">
            <div className="lp-card">
              <div className="lp-card-title">O que fazemos</div>
              <div className="lp-card-desc">
                • Treinos guiados por tópicos<br/>
                • Simulados e contests internos<br/>
                • Roadmaps e material didático<br/>
                • Integração com plataformas de judge
              </div>
            </div>
            <div className="lp-card">
              <div className="lp-card-title">Como participar</div>
              <div className="lp-card-desc">
                • Encontros semanais presenciais/online (CB-106, toda terça-feira às 18h40)<br/>
                • Comunidade no Discord/Telegram
              </div>
            </div>
            <div className="lp-badges">
              <Badge icon={<CalendarDays size={16} />} title="Treinos Semanais" />
              <Badge icon={<BookOpen size={16} />} title="Materiais Curados" />
              <Badge icon={<MessageSquareHeart size={16} />} title="Comunidade & Mentoria" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lp-section" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-h2">Features da Plataforma</h2>
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
      <section id="leaderboard" className="lp-section lp-section-alt" style={{ scrollMarginTop: '80px' }}>
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
      <section id="faq" className="lp-section" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-container">
          <div className="lp-section-head">
            <h3 className="lp-h3">Perguntas frequentes</h3>
          </div>

          <div className="lp-faq-grid">
            <div className="lp-faq-item">
              <div className="lp-faq-q">O que preciso saber para começar?</div>
              <div className="lp-faq-a">Nenhum pré-requisito é necessário, mas ajuda ter familiaridade com alguma linguagem como C, C++, Python ou Java.</div>
            </div>
            <div className="lp-faq-item">
              <div className="lp-faq-q">Preciso ser da UTFPR-CT para participar?</div>
              <div className="lp-faq-a">Não. As atividades são abertas à comunidade: estudantes da UTFPR-CT ou de outras instituições, e profissionais interessados.</div>
            </div>
            <div className="lp-faq-item">
              <div className="lp-faq-q">Participar vale horas de extensão?</div>
              <div className="lp-faq-a">Horas extensionistas são válidas para quem participa ativamente na organização e execução das ações do Clube. Apenas competir não rende horas.</div>
            </div>
            <div className="lp-faq-item">
              <div className="lp-faq-q">Como funcionam os pontos do ranking?</div>
              <div className="lp-faq-a">Pontuação normalizada por dificuldade, tempo e penalidades, combinando múltiplos juízes de forma transparente.</div>
            </div>
            <div className="lp-faq-item">
              <div className="lp-faq-q">Vocês têm juiz próprio?</div>
              <div className="lp-faq-a">Não. Usamos um agregador leve que centraliza o progresso em plataformas como Codeforces e AtCoder.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section id="quote" className="lp-section">
        <div className="lp-container">
          <div className="lp-quote">
            <div className="lp-quote-mark">“”</div>
            <blockquote className="lp-quote-text">
              <em>Please note that being well-versed in competitive programming is not the end goal, but only a means to an end. The true end goal is to produce all-rounder computer scientists/programmers who are much readier to produce better software and to face harder CS research problems in the future.</em>
            </blockquote>
            <div className="lp-quote-author">Steve &amp; Felix Halim • Authors of Competitive Programming</div>
          </div>
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
