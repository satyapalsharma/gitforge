'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';

/* ================================================================
   Animated Contribution Graph for Hero Section
   ================================================================ */
function HeroContributionGraph() {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    const weeks = 52;
    const days = 7;
    const newCells = [];

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const random = Math.random();
        let level = 0;
        if (random > 0.7) level = 1;
        if (random > 0.82) level = 2;
        if (random > 0.9) level = 3;
        if (random > 0.95) level = 4;

        newCells.push({
          week: w,
          day: d,
          level,
          delay: (w * 7 + d) * 8,
        });
      }
    }
    setCells(newCells);
  }, []);

  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

  return (
    <div style={{
      display: 'inline-block',
      background: 'rgba(22, 27, 34, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(52, 12px)`,
        gridTemplateRows: `repeat(7, 12px)`,
        gap: '3px',
      }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: colors[cell.level],
              gridColumn: cell.week + 1,
              gridRow: cell.day + 1,
              animation: `cellFill 0.4s ease-out ${cell.delay}ms both`,
              transition: 'background-color 0.3s ease',
            }}
            title={`${cell.level} contributions`}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Floating Code Particles Background
   ================================================================ */
function FloatingParticles() {
  const particles = useMemo(() => {
    const codeSnippets = [
      'const app = express()', 'git commit -m "feat"', 'npm install',
      'def main():', 'func main() {', 'public static void',
      'import React', 'console.log()', 'return 0;',
      '#!/bin/bash', 'docker build', 'kubectl apply',
    ];

    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      text: codeSnippets[i],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      opacity: 0.04 + Math.random() * 0.06,
      size: 11 + Math.random() * 3,
    }));
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            fontFamily: 'var(--font-mono)',
            fontSize: `${p.size}px`,
            color: 'var(--text-primary)',
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            whiteSpace: 'nowrap',
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

/* ================================================================
   GitHub SVG Icon
   ================================================================ */
function GitHubIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

/* ================================================================
   Anvil/Forge Brand Icon
   ================================================================ */
function BrandIcon() {
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: 'var(--gradient-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
    }}>
      ⚒️
    </div>
  );
}

/* ================================================================
   Main Landing Page
   ================================================================ */
export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSignIn = useCallback(() => {
    signIn('github', { callbackUrl: '/dashboard' });
  }, []);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--accent-purple)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar" id="main-navbar">
        <a href="/" className="navbar-brand">
          <BrandIcon />
          <span>Git<span className="gradient-text">Forge</span></span>
        </a>
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <button
            id="nav-signin-btn"
            onClick={handleSignIn}
            style={{
              padding: '8px 20px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <GitHubIcon size={16} />
            Sign in with GitHub
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero container" id="hero">
        <FloatingParticles />

        <div className="hero-badge">
          <span className="dot" />
          AI-Powered GitHub Profile Builder
        </div>

        <h1>
          Make Your GitHub<br />
          <span className="gradient-text">Profile Shine</span> ✨
        </h1>

        <p className="hero-subtitle">
          Generate real open-source projects with AI and automatically commit them
          to your GitHub with realistic backdated contributions. Stand out to recruiters
          with a green contribution graph.
        </p>

        <div className="hero-actions">
          <button
            id="hero-signin-btn"
            onClick={handleSignIn}
            style={{
              padding: '14px 32px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all var(--transition-normal)',
              boxShadow: 'var(--shadow-glow-purple)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = 'var(--shadow-glow-purple)';
            }}
          >
            <GitHubIcon size={20} />
            Get Started — It&apos;s Free
          </button>

          <a
            href="#how-it-works"
            style={{
              padding: '14px 32px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-normal)',
              textDecoration: 'none',
            }}
          >
            See How It Works →
          </a>
        </div>

        <div className="hero-graph">
          <HeroContributionGraph />
        </div>
      </section>

      {/* Stats */}
      <section className="stats container" id="stats">
        <div className="stats-grid stagger-children">
          <div className="stat-item">
            <h3>50+</h3>
            <p>Project Templates</p>
          </div>
          <div className="stat-item">
            <h3>8+</h3>
            <p>Tech Stacks Supported</p>
          </div>
          <div className="stat-item">
            <h3>365</h3>
            <p>Days of Contributions</p>
          </div>
          <div className="stat-item">
            <h3>∞</h3>
            <p>Green Squares</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container" id="features">
        <div className="section-label">⚡ Features</div>
        <h2 className="section-title">
          Everything You Need to<br />
          <span className="gradient-text">Build a Killer Profile</span>
        </h2>
        <p className="section-subtitle">
          From AI-powered code generation to realistic commit patterns,
          GitForge has you covered.
        </p>

        <div className="features-grid stagger-children">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Code Generation</h3>
            <p>
              Google Gemini generates real, working code for each project.
              Not just empty commits — actual projects that make sense.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Backdated Commits</h3>
            <p>
              Choose any date range and we&apos;ll spread commits naturally.
              More weekdays, some weekends, realistic gaps — just like real coding.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Skill-Based Projects</h3>
            <p>
              Select your tech stack and get project suggestions that match
              your skills. React, Python, Node.js, Go, and more.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Cost Estimation</h3>
            <p>
              See exactly how many tokens and dollars each project will cost
              before you start. No surprises.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Live Preview</h3>
            <p>
              Preview your contribution graph before generating.
              See exactly how your profile will look with the new commits.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Your Keys, Your Data</h3>
            <p>
              You provide your own Gemini API key. We never store it permanently.
              Your GitHub token is used only during generation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works container" id="how-it-works">
        <div className="section-label">🚀 How It Works</div>
        <h2 className="section-title">
          Five Simple Steps to a<br />
          <span className="gradient-text">Green Profile</span>
        </h2>
        <p className="section-subtitle">
          From connecting your GitHub to watching your contribution graph fill up.
        </p>

        <div className="steps-container stagger-children">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Connect Your GitHub</h3>
              <p>
                Sign in with GitHub OAuth. We request repo access to create
                new repositories and push commits on your behalf.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Set Your Skills & API Key</h3>
              <p>
                Choose your tech stack (React, Python, Node.js, etc.) and enter
                your Google Gemini API key for code generation.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Select Projects</h3>
              <p>
                Browse AI-suggested projects based on your skills, or add your
                own custom project ideas. Select up to 10 projects.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Review Estimates & Timeline</h3>
              <p>
                See the token cost, number of commits, and preview your
                contribution graph. Pick your backdate date range.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Generate & Watch It Happen</h3>
              <p>
                Hit generate and watch as AI creates code, pushes to GitHub,
                and fills your contribution graph in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container" id="cta">
        <div className="cta-card">
          <h2>
            Ready to <span className="gradient-text">Forge</span> Your Profile?
          </h2>
          <p>
            Join developers who are building impressive GitHub profiles with AI.
            It takes less than 5 minutes.
          </p>
          <button
            id="cta-signin-btn"
            onClick={handleSignIn}
            style={{
              padding: '14px 36px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all var(--transition-normal)',
              boxShadow: 'var(--shadow-glow-purple)',
              position: 'relative',
            }}
          >
            <GitHubIcon size={20} />
            Start Building Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <p>
          Built with ⚒️ by <a href="#">GitForge</a> · Powered by{' '}
          <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google Gemini</a>
          {' '}· {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
