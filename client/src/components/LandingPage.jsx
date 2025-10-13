import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Users, BarChart3, CalendarDays, Code2, ChevronRight, Github, BookOpen, MessageSquareHeart } from "lucide-react";
import logo from "../assets/logo-cdp.jpg";
import "./landing.css";

export default function LandingPage() {
  // Enable smooth scrolling for in-page anchors
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => { root.style.scrollBehavior = prev; };
  }, []);

  const scrollToId = (e, id) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // respects scroll-margin-top already set on sections
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Keep URL unchanged (do not add or modify hash)
    if (window?.history?.replaceState) {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', url);
    }
  };
  return (
    <div className="lp-root">
      {/* Navbar */}
      <header className="lp-navbar">
        <div className="lp-container lp-navwrap">
          <a href="#top" className="lp-brand" onClick={(e) => scrollToId(e, 'top')}>
            <img src={logo} alt="Clube de Programação UTFPR" className="lp-logo" />
            <span>Clube de Programação • UTFPR-CT</span>
          </a>
          <nav className="lp-nav">
            <a href="#about" onClick={(e) => scrollToId(e, 'about')}>Sobre</a>
            <a href="#faq" onClick={(e) => scrollToId(e, 'faq')}>FAQ</a>
          </nav>
          <div className="lp-actions">
            <Link to="/login" className="lp-btn lp-btn-ghost">Entrar</Link>
            <Link to="/signup" className="lp-btn">
              Criar conta <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero" id="top" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-gridbg" aria-hidden />
        <div className="lp-container lp-hero-inner">
          <h1 className="lp-h1">Clube de Programação</h1>
          <p className="lp-sub"><span className="lp-nowrap" style={{ whiteSpace: 'nowrap' }}> O hub oficial para a comunidade de <span class="lp-kws">programação competitiva</span> da UTFPR</span></p>
          <div className="lp-cta">
            <Link to="/signup" className="lp-btn">
              Começar <ArrowRight size={16} />
            </Link>
            <a href="#features" className="lp-btn lp-btn-outline" onClick={(e) => scrollToId(e, 'features')}>Ver recursos</a>
          </div>
        </div>
      </section>

      {/* Team Photo */}
      <section id="team" className="lp-section lp-section-alt" style={{ scrollMarginTop: '80px' }}>
        <div className="lp-container">
          <figure className="lp-photo">
            <img className="lp-photo-img" src="photo-cdp.jpg" alt="Foto dos membros do Clube de Programação da UTFPR-CT" />
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
                • Oficinas sobre problemas selecionados<br/>
                • Treinos internos<br/>
                • Roadmaps e material didático
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
              <div className="lp-faq-q">Onde e quando acontecem as oficinas?</div>
              <div className="lp-faq-a">As oficinas ocorrem às terças-feiras, das 18h40 às 21h10, na Sala CB104, Bloco B da UTFPR Curitiba – Sede Centro (Av. Sete de Setembro, 3165).</div>
            </div>
            <div className="lp-faq-item">
              <div className="lp-faq-q">Onde posso encontrar materiais e referências?</div>
              <div className="lp-faq-a">Dentro da plataforma temos materiais e problemas para praticar. Também temos uma Jornada de Iniciação para iniciantes.</div>
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
