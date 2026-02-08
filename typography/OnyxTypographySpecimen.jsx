import React, { useState } from 'react';

/**
 * Onyx Report - Typography Specimen
 * 
 * Interactive showcase of the complete typography system.
 * Use this for design review and development reference.
 */

const OnyxTypographySpecimen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'display', label: 'Display' },
    { id: 'headings', label: 'Headings' },
    { id: 'body', label: 'Body' },
    { id: 'ui', label: 'UI Elements' },
    { id: 'data', label: 'Data & FCI' },
    { id: 'code', label: 'Code' },
  ];

  const fonts = {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Plus Jakarta Sans', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
  };

  const typeScale = [
    { name: 'text-xs', size: '12px', rem: '0.75rem' },
    { name: 'text-sm', size: '14px', rem: '0.875rem' },
    { name: 'text-base', size: '16px', rem: '1rem' },
    { name: 'text-lg', size: '18px', rem: '1.125rem' },
    { name: 'text-xl', size: '20px', rem: '1.25rem' },
    { name: 'text-2xl', size: '24px', rem: '1.5rem' },
    { name: 'text-3xl', size: '30px', rem: '1.875rem' },
    { name: 'text-4xl', size: '36px', rem: '2.25rem' },
    { name: 'text-5xl', size: '48px', rem: '3rem' },
    { name: 'text-6xl', size: '60px', rem: '3.75rem' },
    { name: 'text-7xl', size: '72px', rem: '4.5rem' },
  ];

  const weights = [
    { name: 'Normal', value: 400, class: 'font-normal' },
    { name: 'Medium', value: 500, class: 'font-medium' },
    { name: 'Semibold', value: 600, class: 'font-semibold' },
    { name: 'Bold', value: 700, class: 'font-bold' },
    { name: 'Extrabold', value: 800, class: 'font-extrabold' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Mark */}
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="100%" stopColor="#1D4ED8"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#logo-gradient)"/>
                <path d="M32 14L46 32L32 50L18 32L32 14Z" fill="white"/>
              </svg>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.sans }}>
                  Typography Specimen
                </h1>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Onyx Report Brand System
                </p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-12">
            {/* Font Families */}
            <section>
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.sans }}>
                Font Families
              </h2>
              <div className="grid gap-6">
                {/* Inter */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inter</h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Primary UI Font</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      Sans-serif
                    </span>
                  </div>
                  <p className={`text-4xl font-normal mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.sans }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: fonts.mono }}>
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
                  </p>
                </div>

                {/* Plus Jakarta Sans */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Plus Jakarta Sans</h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Display / Marketing</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      Display
                    </span>
                  </div>
                  <p className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: fonts.mono }}>
                    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif
                  </p>
                </div>

                {/* JetBrains Mono */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>JetBrains Mono</h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Code / Data</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                      Monospace
                    </span>
                  </div>
                  <p className={`text-4xl font-normal mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.mono }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: fonts.mono }}>
                    font-family: 'JetBrains Mono', 'SF Mono', monospace
                  </p>
                </div>
              </div>
            </section>

            {/* Type Scale */}
            <section>
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.sans }}>
                Type Scale (1.250 - Major Third)
              </h2>
              <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-700' : 'bg-slate-200'}>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Name</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Size</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Rem</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeScale.map((item, index) => (
                      <tr key={item.name} className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontFamily: fonts.mono }}>
                          {item.name}
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.size}
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: fonts.mono }}>
                          {item.rem}
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          <span style={{ fontSize: item.rem, fontFamily: fonts.sans }}>Aa</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Font Weights */}
            <section>
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.sans }}>
                Font Weights
              </h2>
              <div className="grid gap-4">
                {weights.map(weight => (
                  <div 
                    key={weight.name}
                    className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                  >
                    <span 
                      className={`text-2xl ${darkMode ? 'text-white' : 'text-slate-900'}`}
                      style={{ fontFamily: fonts.sans, fontWeight: weight.value }}
                    >
                      {weight.name} ({weight.value})
                    </span>
                    <code className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`} style={{ fontFamily: fonts.mono }}>
                      {weight.class}
                    </code>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Display Section */}
        {activeSection === 'display' && (
          <div className="space-y-8">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Font: Plus Jakarta Sans
              </p>
            </div>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>display-2xl · 72px · Extrabold</span>
                <p className={`mt-2 font-extrabold leading-none tracking-[-0.03em] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display, fontSize: '72px' }}>
                  See clearly.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>display-xl · 60px · Extrabold</span>
                <p className={`mt-2 font-extrabold leading-tight tracking-[-0.02em] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display, fontSize: '60px' }}>
                  Decide confidently.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>display-lg · 48px · Bold</span>
                <p className={`mt-2 font-bold leading-tight tracking-[-0.02em] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display, fontSize: '48px' }}>
                  Plan strategically.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>display-md · 36px · Bold</span>
                <p className={`mt-2 font-bold leading-snug tracking-[-0.015em] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display, fontSize: '36px' }}>
                  Facility Condition Intelligence
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>display-sm · 30px · Bold</span>
                <p className={`mt-2 font-bold leading-snug tracking-[-0.01em] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: fonts.display, fontSize: '30px' }}>
                  Transform assessment data into action
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Headings Section */}
        {activeSection === 'headings' && (
          <div className="space-y-8">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Font: Inter
              </p>
            </div>

            <div className="space-y-4">
              {[
                { level: 'h1', size: '30px', weight: 'Semibold', example: 'Portfolio Overview' },
                { level: 'h2', size: '24px', weight: 'Semibold', example: 'Branch Summary' },
                { level: 'h3', size: '20px', weight: 'Semibold', example: 'Building Details' },
                { level: 'h4', size: '18px', weight: 'Semibold', example: 'Assessment Status' },
                { level: 'h5', size: '16px', weight: 'Semibold', example: 'Element Conditions' },
                { level: 'h6', size: '14px', weight: 'Semibold', example: 'CATEGORY LABEL', uppercase: true },
              ].map((heading, idx) => (
                <div key={heading.level} className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {heading.level} · {heading.size} · {heading.weight}
                    </span>
                  </div>
                  <p 
                    className={`font-semibold ${heading.uppercase ? 'uppercase tracking-wide' : ''} ${darkMode ? 'text-white' : 'text-slate-900'}`}
                    style={{ 
                      fontFamily: fonts.sans, 
                      fontSize: heading.size,
                      lineHeight: heading.level === 'h6' ? 1.5 : 1.25,
                    }}
                  >
                    {heading.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body Section */}
        {activeSection === 'body' && (
          <div className="space-y-8">
            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Lead Paragraph</h3>
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className={`text-xl leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontFamily: fonts.sans }}>
                  Onyx Report transforms facility condition assessment from a spreadsheet-bound exercise into a strategic intelligence platform. See your portfolio clearly, decide confidently, and plan strategically.
                </p>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Body Text Sizes</h3>
              <div className="space-y-4">
                {[
                  { name: 'body-xl', size: '20px', text: 'Body XL - For emphasized content and introductions' },
                  { name: 'body-lg', size: '18px', text: 'Body LG - For important secondary content' },
                  { name: 'body-md', size: '16px', text: 'Body MD - Default paragraph text for most content' },
                  { name: 'body-sm', size: '14px', text: 'Body SM - For secondary information and metadata' },
                  { name: 'body-xs', size: '12px', text: 'Body XS - For captions, footnotes, and fine print' },
                ].map(body => (
                  <div key={body.name} className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className={darkMode ? 'text-white' : 'text-slate-900'} style={{ fontFamily: fonts.sans, fontSize: body.size }}>
                      {body.text}
                    </p>
                    <code className={`text-xs px-2 py-1 rounded ml-4 whitespace-nowrap ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                      {body.name}
                    </code>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Text Colors</h3>
              <div className="space-y-3">
                {[
                  { name: 'text-primary', color: darkMode ? '#F8FAFC' : '#0F172A', desc: 'Primary text' },
                  { name: 'text-secondary', color: darkMode ? '#CBD5E1' : '#334155', desc: 'Secondary text' },
                  { name: 'text-muted', color: darkMode ? '#94A3B8' : '#64748B', desc: 'Muted text' },
                  { name: 'text-subtle', color: darkMode ? '#64748B' : '#94A3B8', desc: 'Subtle text' },
                  { name: 'text-brand', color: darkMode ? '#60A5FA' : '#2563EB', desc: 'Brand blue' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: item.color }} />
                    <span style={{ color: item.color, fontFamily: fonts.sans, fontSize: '16px' }}>{item.desc}</span>
                    <code className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {item.name}
                    </code>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* UI Elements Section */}
        {activeSection === 'ui' && (
          <div className="space-y-8">
            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Labels & Form Text</h3>
              <div className={`p-6 rounded-xl space-y-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontFamily: fonts.sans }}>
                    Form Label <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Input field"
                    className={`mt-1 w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    style={{ fontFamily: fonts.sans, fontSize: '16px' }}
                  />
                  <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: fonts.sans }}>
                    Helper text provides additional context
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-500" style={{ fontFamily: fonts.sans }}>
                    Error: This field is required
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Special Text Styles</h3>
              <div className="grid gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    OVERLINE / CATEGORY
                  </span>
                  <code className={`ml-4 text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>.overline</code>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Caption text for images and tables
                  </span>
                  <code className={`ml-4 text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>.caption</code>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Links</h3>
              <div className={`p-6 rounded-xl space-y-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p style={{ fontFamily: fonts.sans }}>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Standard </span>
                  <a href="#" className={`underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                    link style
                  </a>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}> within text.</span>
                </p>
                <p style={{ fontFamily: fonts.sans }}>
                  <a href="#" className={`${darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}>
                    Subtle link style
                  </a>
                  <span className={`text-xs ml-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>(for navigation)</span>
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Data & FCI Section */}
        {activeSection === 'data' && (
          <div className="space-y-8">
            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Data Values</h3>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Font: JetBrains Mono (Tabular Numbers)
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Large', value: '$2.4M', size: '48px' },
                  { label: 'Medium', value: '127', size: '36px' },
                  { label: 'Small', value: '42%', size: '24px' },
                ].map(item => (
                  <div key={item.label} className={`p-6 rounded-xl text-center ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                    <p 
                      className={`mt-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}
                      style={{ fontFamily: fonts.mono, fontSize: item.size, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>FCI Condition Display</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 3.2, label: 'Good', color: '#10B981', bg: '#ECFDF5' },
                  { value: 7.8, label: 'Fair', color: '#F59E0B', bg: '#FFFBEB' },
                  { value: 18.5, label: 'Poor', color: '#F97316', bg: '#FFF7ED' },
                  { value: 42.1, label: 'Critical', color: '#EF4444', bg: '#FEF2F2' },
                ].map(fci => (
                  <div 
                    key={fci.label}
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : fci.bg }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: fci.color }}>
                      {fci.label}
                    </span>
                    <p 
                      className="mt-2 font-bold"
                      style={{ fontFamily: fonts.mono, fontSize: '48px', color: fci.color, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {fci.value}%
                    </p>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      FCI Range: {fci.label === 'Good' ? '0-5%' : fci.label === 'Fair' ? '5-10%' : fci.label === 'Poor' ? '10-30%' : '30%+'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Code Section */}
        {activeSection === 'code' && (
          <div className="space-y-8">
            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inline Code</h3>
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-700'} style={{ fontFamily: fonts.sans }}>
                  The FCI is calculated as <code className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-800'}`} style={{ fontFamily: fonts.mono }}>deferredMaintenance / replacementValue</code> and expressed as a percentage.
                </p>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Code Block</h3>
              <pre className="p-6 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto" style={{ fontFamily: fonts.mono, fontSize: '14px', lineHeight: 1.625 }}>
{`// Calculate Facility Condition Index
const calculateFCI = (building) => {
  const deferredMaintenance = building.deficiencies
    .reduce((sum, d) => sum + d.cost, 0);
  
  const fci = deferredMaintenance / building.replacementValue;
  
  return {
    value: (fci * 100).toFixed(1),
    condition: getFCICondition(fci * 100)
  };
};`}
              </pre>
            </section>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className={`text-sm text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Onyx Report Typography System · Part of the Onyx Report Brand Guidelines
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OnyxTypographySpecimen;
