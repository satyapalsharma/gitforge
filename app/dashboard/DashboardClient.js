'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { signOut } from 'next-auth/react';

/* ================================================================
   ICONS (inline SVGs)
   ================================================================ */
const Icons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Code: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Key: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  GitHub: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
  ),
};

/* ================================================================
   SKILL DEFINITIONS
   ================================================================ */
const SKILLS = [
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'nextjs', name: 'Next.js', icon: '▲' },
  { id: 'vue', name: 'Vue.js', icon: '💚' },
  { id: 'angular', name: 'Angular', icon: '🅰️' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'html-css', name: 'HTML/CSS', icon: '🎨' },
  { id: 'swift', name: 'Swift', icon: '🍎' },
  { id: 'kotlin', name: 'Kotlin', icon: '🟣' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },
  { id: 'php', name: 'PHP', icon: '🐘' },
];

/* ================================================================
   STEP 1: Skills & API Key Setup
   ================================================================ */
function StepSkillsSetup({ selectedSkills, setSelectedSkills, geminiKey, setGeminiKey, keyValid, setKeyValid, onNext }) {
  const [validating, setValidating] = useState(false);
  const [keyError, setKeyError] = useState('');

  const toggleSkill = useCallback((skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    );
  }, [setSelectedSkills]);

  const validateKey = useCallback(async () => {
    if (!geminiKey.trim()) {
      setKeyError('Please enter your API key');
      return;
    }
    setValidating(true);
    setKeyError('');
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiKey }),
      });
      const data = await res.json();
      if (data.valid) {
        setKeyValid(true);
        setKeyError('');
      } else {
        setKeyError(data.error || 'Invalid API key');
        setKeyValid(false);
      }
    } catch {
      setKeyError('Failed to validate key. Please try again.');
      setKeyValid(false);
    }
    setValidating(false);
  }, [geminiKey, setKeyValid]);

  const canProceed = selectedSkills.length > 0 && keyValid;

  return (
    <div className="animate-fade-in-up">
      {/* Skills Selection */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Select Your Skills
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Choose the tech stacks you&apos;re comfortable with. We&apos;ll suggest projects that match.
        </p>
        <div className="skills-grid">
          {SKILLS.map(skill => (
            <button
              key={skill.id}
              id={`skill-${skill.id}`}
              className={`skill-chip ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
              onClick={() => toggleSkill(skill.id)}
            >
              <span className="skill-icon">{skill.icon}</span>
              {skill.name}
            </button>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
            {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* API Key Input */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Gemini API Key
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Enter your Google Gemini API key for AI code generation.{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple-light)' }}>
            Get one free →
          </a>
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', maxWidth: '600px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}>
              <Icons.Key />
            </span>
            <input
              id="gemini-api-key-input"
              type="password"
              value={geminiKey}
              onChange={(e) => { setGeminiKey(e.target.value); setKeyValid(false); setKeyError(''); }}
              placeholder="AIza..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                background: 'var(--bg-tertiary)',
                border: `1px solid ${keyError ? 'var(--danger)' : keyValid ? 'var(--success)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)',
                transition: 'border-color var(--transition-fast)',
                outline: 'none',
              }}
            />
          </div>
          <button
            id="validate-key-btn"
            onClick={validateKey}
            disabled={validating || !geminiKey.trim()}
            style={{
              padding: '12px 24px',
              background: keyValid ? 'rgba(63, 185, 80, 0.15)' : 'var(--gradient-primary)',
              borderRadius: 'var(--radius-md)',
              color: keyValid ? 'var(--success)' : 'white',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              border: keyValid ? '1px solid var(--success)' : 'none',
              cursor: validating ? 'wait' : 'pointer',
              opacity: validating || !geminiKey.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {validating ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                Validating...
              </>
            ) : keyValid ? (
              <>
                <Icons.Check /> Valid
              </>
            ) : (
              'Validate'
            )}
          </button>
        </div>
        {keyError && (
          <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            {keyError}
          </p>
        )}
      </div>

      {/* Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          id="step1-next-btn"
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: '12px 32px',
            background: canProceed ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            color: canProceed ? 'white' : 'var(--text-tertiary)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-normal)',
          }}
        >
          Continue <Icons.ChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 2: Project Selection
   ================================================================ */
function StepProjectSelection({ selectedSkills, selectedProjects, setSelectedProjects, onNext, onBack }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customTech, setCustomTech] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [customComplexity, setCustomComplexity] = useState('medium');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch all matching projects for the skills
      const url = `/api/projects/suggest?skills=${selectedSkills.join(',')}`;
      const res = await fetch(url);
      const data = await res.json();
      let projects = data.projects || [];
      
      // We always shuffle the array to give a random feel, especially on "Refresh"
      for (let i = projects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [projects[i], projects[j]] = [projects[j], projects[i]];
      }

      // If we have a lot of projects, just show 8 at a time so the UI isn't cluttered
      // and "Shuffle/Refresh" actually shows a different set of projects.
      if (projects.length > 8) {
        projects = projects.slice(0, 8);
      }
      
      setSuggestions(projects);
    } catch (e) {
      console.error('Failed to fetch suggestions:', e);
    }
    setLoading(false);
  }, [selectedSkills]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const filteredSuggestions = useMemo(() => {
    if (difficultyFilter === 'all') return suggestions;
    return suggestions.filter(p => p.estimatedComplexity === difficultyFilter);
  }, [suggestions, difficultyFilter]);

  const toggleProject = useCallback((project) => {
    setSelectedProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) {
        return prev.filter(p => p.id !== project.id);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, project];
    });
  }, [setSelectedProjects]);

  const addCustomProject = useCallback(() => {
    if (!customName.trim() || !customDesc.trim()) return;
    const complexityFileMap = { simple: 5, medium: 10, complex: 18, 'very-complex': 75 };
    const customProject = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      description: customDesc.trim(),
      techStack: customTech.split(',').map(t => t.trim()).filter(Boolean),
      estimatedFiles: complexityFileMap[customComplexity] || 8,
      estimatedComplexity: customComplexity,
      icon: '📦',
      isCustom: true,
    };
    setSelectedProjects(prev => [...prev, customProject]);
    setCustomName('');
    setCustomDesc('');
    setCustomTech('');
    setCustomComplexity('medium');
    setShowCustomForm(false);
  }, [customName, customDesc, customTech, customComplexity, setSelectedProjects]);

  const difficulties = [
    { value: 'all', label: 'All', icon: '🎯' },
    { value: 'simple', label: 'Simple', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'complex', label: 'Complex', icon: '🔴' },
    { value: 'very-complex', label: 'Very Complex', icon: '🔥' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Select Projects
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Choose up to 10 projects to generate. {selectedProjects.length}/10 selected.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            id="refresh-suggestions-btn"
            onClick={() => fetchSuggestions(true)}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: 'var(--surface-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
              opacity: loading ? 0.6 : 1,
            }}
            title="Shuffle project suggestions"
          >
            🔀 Shuffle
          </button>
          <button
            id="add-custom-project-btn"
            onClick={() => setShowCustomForm(!showCustomForm)}
            style={{
              padding: '10px 20px',
              background: 'var(--surface-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icons.Plus /> Add Custom Project
          </button>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {difficulties.map(d => (
          <button
            key={d.value}
            id={`filter-${d.value}`}
            onClick={() => setDifficultyFilter(d.value)}
            style={{
              padding: '8px 16px',
              background: difficultyFilter === d.value ? 'var(--gradient-primary)' : 'var(--surface-default)',
              border: `1px solid ${difficultyFilter === d.value ? 'transparent' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-full)',
              color: difficultyFilter === d.value ? 'white' : 'var(--text-secondary)',
              fontWeight: difficultyFilter === d.value ? 700 : 500,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)',
            }}
          >
            {d.icon} {d.label}
            {d.value !== 'all' && (
              <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                ({suggestions.filter(p => p.estimatedComplexity === d.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom Project Form */}
      {showCustomForm && (
        <div style={{
          background: 'var(--surface-default)',
          border: '1px solid var(--accent-purple)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Custom Project</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <input
              id="custom-project-name"
              placeholder="Project name (e.g., My Todo App)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            />
            <textarea
              id="custom-project-desc"
              placeholder="Project description (e.g., A full-stack todo app with authentication...)"
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              rows={3}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <input
              id="custom-project-tech"
              placeholder="Tech stack (comma separated, e.g., React, Node.js, MongoDB)"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            />
            {/* Complexity selector for custom project */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Complexity:</span>
              {['simple', 'medium', 'complex', 'very-complex'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCustomComplexity(level)}
                  style={{
                    padding: '6px 14px',
                    background: customComplexity === level
                      ? (level === 'simple' ? 'rgba(63, 185, 80, 0.15)' : level === 'medium' ? 'rgba(210, 153, 34, 0.15)' : level === 'complex' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(163, 113, 247, 0.15)')
                      : 'var(--bg-tertiary)',
                    border: `1px solid ${customComplexity === level
                      ? (level === 'simple' ? 'rgba(63, 185, 80, 0.4)' : level === 'medium' ? 'rgba(210, 153, 34, 0.4)' : level === 'complex' ? 'rgba(248, 81, 73, 0.4)' : 'rgba(163, 113, 247, 0.4)')
                      : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-full)',
                    color: customComplexity === level
                      ? (level === 'simple' ? 'var(--success)' : level === 'medium' ? 'var(--warning)' : level === 'complex' ? 'var(--danger)' : '#a371f7')
                      : 'var(--text-tertiary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: customComplexity === level ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {level === 'simple' ? '🟢' : level === 'medium' ? '🟡' : level === 'complex' ? '🔴' : '🔥'} {level.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCustomForm(false)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Cancel
              </button>
              <button
                id="add-custom-project-submit"
                onClick={addCustomProject}
                disabled={!customName.trim() || !customDesc.trim()}
                style={{
                  padding: '8px 16px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  border: 'none',
                  opacity: !customName.trim() || !customDesc.trim() ? 0.5 : 1,
                }}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading project suggestions...</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredSuggestions.map(project => {
            const isSelected = selectedProjects.some(p => p.id === project.id);
            return (
              <div
                key={project.id}
                id={`project-${project.id}`}
                className={`project-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleProject(project)}
              >
                <div className="project-card-header">
                  <span className="project-card-icon">{project.icon}</span>
                  <span className="project-card-name">{project.name}</span>
                </div>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-tags">
                  {project.techStack.map(tech => (
                    <span key={tech} style={{
                      padding: '2px 10px',
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--accent-purple-light)',
                      fontWeight: 500,
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-card-meta">
                  <span>~{project.estimatedFiles} files</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    background: project.estimatedComplexity === 'simple' ? 'rgba(63, 185, 80, 0.15)' :
                      project.estimatedComplexity === 'medium' ? 'rgba(210, 153, 34, 0.15)' :
                      project.estimatedComplexity === 'complex' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(163, 113, 247, 0.15)',
                    color: project.estimatedComplexity === 'simple' ? 'var(--success)' :
                      project.estimatedComplexity === 'medium' ? 'var(--warning)' :
                      project.estimatedComplexity === 'complex' ? 'var(--danger)' : '#a371f7',
                  }}>
                    {project.estimatedComplexity.replace('-', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
        <button
          id="step2-back-btn"
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          id="step2-next-btn"
          onClick={onNext}
          disabled={selectedProjects.length === 0}
          style={{
            padding: '12px 32px',
            background: selectedProjects.length > 0 ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            color: selectedProjects.length > 0 ? 'white' : 'var(--text-tertiary)',
            fontWeight: 700,
            border: 'none',
            cursor: selectedProjects.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Continue <Icons.ChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 3: Review Estimates & Date Range
   ================================================================ */
function StepReviewEstimate({ selectedProjects, dateRange, setDateRange, persona, setPersona, scheduleProfile, setScheduleProfile, onNext, onBack, setSelectedProjects }) {
  const [estimates, setEstimates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEstimate() {
      try {
        const res = await fetch('/api/projects/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: selectedProjects }),
        });
        const data = await res.json();
        setEstimates(data);
      } catch (e) {
        console.error('Failed to fetch estimates:', e);
      }
      setLoading(false);
    }
    fetchEstimate();
  }, [selectedProjects]);

  // Generate a preview contribution data
  const previewData = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate || !estimates) return [];
    const data = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCommits = estimates.totalCommits || 50;
    const commitsPerDay = totalCommits / Math.max(totalDays, 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const random = Math.random();
      let count = 0;
      if (isWeekday) {
        if (random > 0.3) count = Math.floor(Math.random() * commitsPerDay * 3) + 1;
      } else {
        if (random > 0.6) count = Math.floor(Math.random() * commitsPerDay * 2) + 1;
      }
      data.push({
        date: new Date(d).toISOString().split('T')[0],
        count: Math.min(count, 12),
      });
    }
    return data;
  }, [dateRange, estimates]);

  const removeProject = useCallback((projectId) => {
    setSelectedProjects(prev => prev.filter(p => p.id !== projectId));
  }, [setSelectedProjects]);

  return (
    <div className="animate-fade-in-up">
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        Review & Estimate
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
        Review your selected projects, check costs, and set your backdate period.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left: Projects list */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
            Selected Projects ({selectedProjects.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {selectedProjects.map(project => (
              <div key={project.id} style={{
                background: 'var(--surface-default)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xl)' }}>{project.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{project.name}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                      {project.estimatedComplexity} · ~{project.estimatedFiles} files
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeProject(project.id)}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(248, 81, 73, 0.1)',
                    border: '1px solid rgba(248, 81, 73, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Date Range & Persona */}
          <h3 style={{ fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
            Generation Settings
          </h3>
          <div className="date-range-picker" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="date-input-group">
              <label htmlFor="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={dateRange.startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                value={dateRange.endDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="persona-select" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Commit Persona (AI Style)
            </label>
            <select
              id="persona-select"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                width: '100%',
              }}
            >
              <option value="professional">Professional (Standard conventional commits)</option>
              <option value="emoji">Emoji-heavy 🚀 (Fun & descriptive)</option>
              <option value="terse">Terse (Very short, e.g. "fix", "upd")</option>
              <option value="chaotic">Chaotic (e.g. "hopefully this passes lol")</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <label htmlFor="schedule-select" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Working Hours Profile
            </label>
            <select
              id="schedule-select"
              value={scheduleProfile}
              onChange={(e) => setScheduleProfile(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                width: '100%',
              }}
            >
              <option value="balanced">Balanced (Evenly spread, mostly days)</option>
              <option value="9-to-5">9-to-5 (Strictly business hours on weekdays)</option>
              <option value="weekend-warrior">Weekend Warrior (Heavy weekends + some evenings)</option>
              <option value="night-owl">Night Owl (Late night coding sessions)</option>
            </select>
          </div>

          {/* Contribution Preview */}
          {previewData.length > 0 && (
            <div style={{ marginTop: 'var(--space-8)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
                Contribution Preview
              </h3>
              <PreviewAnalytics data={previewData} />
              <MiniContributionGraph data={previewData} />
            </div>
          )}
        </div>

        {/* Right: Estimate Panel */}
        <div className="estimate-panel" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-4))' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
            Cost Estimate
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : estimates ? (
            <>
              <div className="estimate-row">
                <span className="estimate-label">Total Projects</span>
                <span className="estimate-value">{estimates.totalProjects}</span>
              </div>
              <div className="estimate-row">
                <span className="estimate-label">Est. Output Tokens</span>
                <span className="estimate-value">{(estimates.totalTokens / 1000).toFixed(0)}K</span>
              </div>
              <div className="estimate-row">
                <span className="estimate-label">Est. Commits</span>
                <span className="estimate-value">{estimates.totalCommits}</span>
              </div>
              <div className="estimate-row">
                <span className="estimate-label">Est. Files</span>
                <span className="estimate-value">{estimates.totalFiles}</span>
              </div>
              <div className="estimate-row estimate-total">
                <span className="estimate-label" style={{ fontWeight: 600 }}>Estimated Cost</span>
                <span className="estimate-value">${estimates.totalCost?.toFixed(4)}</span>
              </div>
              <p style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-3)',
                textAlign: 'center',
              }}>
                Based on Gemini 2.5 Flash pricing
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Failed to load estimates</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
        <button
          id="step3-back-btn"
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          id="step3-next-btn"
          onClick={onNext}
          disabled={!dateRange.startDate || !dateRange.endDate || selectedProjects.length === 0}
          style={{
            padding: '12px 32px',
            background: dateRange.startDate && dateRange.endDate ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            color: dateRange.startDate && dateRange.endDate ? 'white' : 'var(--text-tertiary)',
            fontWeight: 700,
            border: 'none',
            cursor: dateRange.startDate && dateRange.endDate ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icons.Zap /> Start Generating
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   Mini Contribution Graph (Preview in Step 3)
   ================================================================ */
function PreviewAnalytics({ data }) {
  const totalCommits = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const maxCommits = Math.max(...data.map((d) => d.count), 0);
  
  let currentStreak = 0;
  let maxStreak = 0;
  data.forEach((d) => {
    if (d.count > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  const cardStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle = { fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' };
  const valueStyle = { fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Total Commits</div>
        <div style={valueStyle}>{totalCommits}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Active Days</div>
        <div style={valueStyle}>{activeDays}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Longest Streak</div>
        <div style={valueStyle}>{maxStreak} <span style={{fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)'}}>days</span></div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Busiest Day</div>
        <div style={valueStyle}>{maxCommits} <span style={{fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)'}}>commits</span></div>
      </div>
    </div>
  );
}

function MiniContributionGraph({ data }) {
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

  const getColor = (count) => {
    if (count === 0) return colors[0];
    if (count <= 2) return colors[1];
    if (count <= 4) return colors[2];
    if (count <= 7) return colors[3];
    return colors[4];
  };

  // Organize data into weeks
  const weeks = [];
  let currentWeek = [];
  data.forEach((item, i) => {
    const dayOfWeek = new Date(item.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(item);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div style={{
      background: 'var(--surface-default)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      overflowX: 'auto',
    }}>
      <div style={{
        display: 'flex',
        gap: '3px',
      }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, di) => (
              <div
                key={di}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: getColor(day.count),
                  transition: 'background-color 0.2s ease',
                }}
                title={`${day.date}: ${day.count} commits`}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
        marginTop: 'var(--space-3)',
        justifyContent: 'flex-end',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
      }}>
        <span>Less</span>
        {colors.map((color, i) => (
          <div key={i} style={{
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            backgroundColor: color,
          }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 4: Generation Progress
   ================================================================ */
function StepGeneration({ selectedProjects, dateRange, geminiKey, session, persona, scheduleProfile }) {
  const [progress, setProgress] = useState({
    status: 'idle',
    currentProject: '',
    currentStep: '',
    currentFile: '',
    overallProgress: 0,
    projectProgress: {},
    logs: [],
    completedRepos: [],
    error: null,
  });

  const startGeneration = useCallback(async () => {
    setProgress(prev => ({ ...prev, status: 'running', logs: [...prev.logs, { time: new Date().toISOString(), msg: '🚀 Starting generation pipeline...' }] }));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: selectedProjects,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          geminiApiKey: geminiKey,
          persona: persona,
          scheduleProfile: scheduleProfile,
          completedProjects: progress.completedRepos.map(r => r.name),
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setProgress(prev => {
             if (prev.status === 'running') {
                return { ...prev, status: 'disconnected', error: 'Connection dropped prematurely.' };
             }
             return prev;
          });
          break;
        }

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            setProgress(prev => {
              const newLogs = [...prev.logs];
              if (data.message) {
                newLogs.push({ time: new Date().toISOString(), msg: data.message });
              }

              // Map the server's repo slug to project IDs for progress tracking
              const newProjectProgress = { ...prev.projectProgress };
              if (data.project) {
                // Find the matching project by comparing slugified names
                const matchedProject = selectedProjects.find(p =>
                  p.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') === data.project
                );
                const projectKey = matchedProject?.id || data.project;
                newProjectProgress[projectKey] = {
                  status: data.step === 'committing' ? 'committing' :
                    data.type === 'project-complete' ? 'completed' :
                    data.type === 'error' ? 'failed' : 'generating',
                  progress: data.type === 'project-complete' ? 100 : (data.projectProgress ?? prev.projectProgress[projectKey]?.progress ?? 0),
                  currentFile: data.file || '',
                };
              }

              const newCompletedRepos = [...prev.completedRepos];
              if (data.type === 'project-complete' && data.repoUrl) {
                newCompletedRepos.push({ name: data.project, url: data.repoUrl });
              }

              return {
                ...prev,
                status: data.type === 'complete' ? 'completed' : data.type === 'error' && !data.project ? 'failed' : 'running',
                currentProject: data.project || prev.currentProject,
                currentStep: data.step || prev.currentStep,
                currentFile: data.file || prev.currentFile,
                overallProgress: data.type === 'complete' ? 100 : (data.progress || prev.overallProgress),
                projectProgress: newProjectProgress,
                logs: newLogs.slice(-100),
                completedRepos: newCompletedRepos,
                error: data.type === 'error' && !data.project ? data.message : prev.error,
              };
            });
          } catch { /* skip invalid JSON */ }
        }
      }
    } catch (err) {
      setProgress(prev => ({
        ...prev,
        status: 'failed',
        error: err.message,
        logs: [...prev.logs, { time: new Date().toISOString(), msg: `❌ Error: ${err.message}` }],
      }));
    }
  }, [selectedProjects, dateRange, geminiKey]);

  return (
    <div className="animate-fade-in-up generation-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          {progress.status === 'idle' ? '🚀 Ready to Generate' :
            progress.status === 'running' ? '⚡ Generating...' :
              progress.status === 'completed' ? '🎉 Generation Complete!' :
                '❌ Generation Failed'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {progress.status === 'idle' ? `${selectedProjects.length} projects will be created and committed to your GitHub.` :
            progress.status === 'running' ? `Working on: ${progress.currentProject}` :
              progress.status === 'completed' ? 'All projects have been generated and committed!' :
                progress.status === 'disconnected' ? 'The generation process disconnected prematurely.' :
                progress.error}
        </p>

        {(progress.status === 'failed' || progress.status === 'disconnected') && (
          <button
            onClick={startGeneration}
            style={{
              marginTop: 'var(--space-4)',
              padding: '10px 24px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icons.Zap /> {progress.status === 'disconnected' ? 'Resume Generation' : 'Retry'}
          </button>
        )}
      </div>

      {/* Start Button */}
      {progress.status === 'idle' && (
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <button
            id="start-generation-btn"
            onClick={startGeneration}
            style={{
              padding: '16px 48px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: 'var(--text-lg)',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow-purple)',
              transition: 'all var(--transition-normal)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Icons.Zap /> Start Forging
          </button>
        </div>
      )}

      {/* Overall Progress */}
      {progress.status !== 'idle' && (
        <div style={{
          background: 'var(--surface-default)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ fontWeight: 700 }}>{Math.round(progress.overallProgress)}%</span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress.overallProgress}%`,
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease',
              position: 'relative',
            }}>
              {progress.status === 'running' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 2s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Status Cards */}
      {progress.status !== 'idle' && selectedProjects.map(project => {
        const pp = progress.projectProgress[project.id] || { status: 'pending', progress: 0 };
        return (
          <div key={project.id} className="generation-project">
            <div className="generation-project-header">
              <span className="generation-project-name">
                {project.icon} {project.name}
              </span>
              <span className={`generation-status ${pp.status}`}>
                {pp.status === 'pending' && '⏳ Pending'}
                {pp.status === 'generating' && '🤖 Generating'}
                {pp.status === 'committing' && '📤 Committing'}
                {pp.status === 'completed' && '✅ Done'}
                {pp.status === 'failed' && '❌ Failed'}
              </span>
            </div>
            {pp.status !== 'pending' && (
              <div style={{
                height: '4px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pp.progress}%`,
                  background: pp.status === 'completed' ? 'var(--success)' :
                    pp.status === 'failed' ? 'var(--danger)' : 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            )}
            {pp.currentFile && (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', marginTop: 'var(--space-2)' }}>
                📄 {pp.currentFile}
              </p>
            )}
          </div>
        );
      })}

      {/* Completed Repos */}
      {progress.completedRepos.length > 0 && (
        <div style={{
          background: 'rgba(57, 211, 83, 0.08)',
          border: '1px solid rgba(57, 211, 83, 0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginTop: 'var(--space-6)',
        }}>
          <h3 style={{ fontWeight: 700, color: 'var(--green-l4)', marginBottom: 'var(--space-4)' }}>
            🎉 Created Repositories
          </h3>
          {progress.completedRepos.map((repo, i) => (
            <a
              key={i}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) 0',
                color: 'var(--text-link)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <Icons.GitHub /> {repo.name} →
            </a>
          ))}
        </div>
      )}

      {/* Log output */}
      {progress.logs.length > 0 && (
        <div style={{
          marginTop: 'var(--space-6)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
        }}>
          {progress.logs.map((log, i) => (
            <div key={i} style={{ padding: '2px 0', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-tertiary)', marginRight: '8px' }}>
                {new Date(log.time).toLocaleTimeString()}
              </span>
              {log.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STEPPER COMPONENT
   ================================================================ */
function Stepper({ currentStep }) {
  const steps = [
    { label: 'Setup Skills', icon: '⚙️' },
    { label: 'Select Projects', icon: '📦' },
    { label: 'Review & Estimate', icon: '📊' },
    { label: 'Generate', icon: '🚀' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      marginBottom: 'var(--space-10)',
      padding: 'var(--space-4) var(--space-6)',
      background: 'var(--surface-default)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
      overflowX: 'auto',
    }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: i === currentStep ? 'var(--gradient-subtle)' : 'transparent',
            transition: 'all var(--transition-normal)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              background: i < currentStep ? 'var(--success)' :
                i === currentStep ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
              color: i <= currentStep ? 'white' : 'var(--text-tertiary)',
              transition: 'all var(--transition-normal)',
            }}>
              {i < currentStep ? <Icons.Check /> : step.icon}
            </div>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: i === currentStep ? 700 : 500,
              color: i === currentStep ? 'var(--text-primary)' :
                i < currentStep ? 'var(--success)' : 'var(--text-tertiary)',
            }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: '40px',
              height: '2px',
              background: i < currentStep ? 'var(--success)' : 'var(--border-default)',
              margin: '0 var(--space-1)',
              transition: 'background var(--transition-normal)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   MAIN DASHBOARD CLIENT
   ================================================================ */
export default function DashboardClient({ session }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [keyValid, setKeyValid] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [persona, setPersona] = useState('professional');
  const [scheduleProfile, setScheduleProfile] = useState('balanced');

  const goNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar" id="dashboard-navbar">
        <a href="/" className="navbar-brand">
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚒️</div>
          <span>Git<span className="gradient-text">Forge</span></span>
        </a>
        <div className="navbar-links">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid var(--border-default)',
                }}
              />
            )}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.user?.name || session.user?.githubUsername}
            </span>
            <button
              id="signout-btn"
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icons.LogOut /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        paddingTop: 'calc(var(--navbar-height) + var(--space-8))',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: 'calc(var(--navbar-height) + var(--space-8)) var(--space-6) var(--space-16)',
      }}>
        {/* Stepper */}
        <Stepper currentStep={currentStep} />

        {/* Step Content */}
        {currentStep === 0 && (
          <StepSkillsSetup
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            keyValid={keyValid}
            setKeyValid={setKeyValid}
            onNext={goNext}
          />
        )}
        {currentStep === 1 && (
          <StepProjectSelection
            selectedSkills={selectedSkills}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 2 && (
          <StepReviewEstimate
            selectedProjects={selectedProjects}
            dateRange={dateRange}
            setDateRange={setDateRange}
            persona={persona}
            setPersona={setPersona}
            scheduleProfile={scheduleProfile}
            setScheduleProfile={setScheduleProfile}
            onNext={goNext}
            onBack={goBack}
            setSelectedProjects={setSelectedProjects}
          />
        )}
        {currentStep === 3 && (
          <StepGeneration
            selectedProjects={selectedProjects}
            dateRange={dateRange}
            geminiKey={geminiKey}
            session={session}
            persona={persona}
            scheduleProfile={scheduleProfile}
          />
        )}
      </main>
    </div>
  );
}
