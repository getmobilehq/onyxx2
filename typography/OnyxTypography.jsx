/**
 * Onyx Report - Typography Components
 * 
 * A complete set of React components for consistent typography across the application.
 * Each component is pre-styled according to the Onyx Report brand guidelines.
 * 
 * Usage:
 * import { Display, Heading, Text, Label, Code } from './OnyxTypography';
 */

import React from 'react';

// ============================================
// TYPE SCALE REFERENCE
// ============================================
// text-xs:   12px  | 0.75rem
// text-sm:   14px  | 0.875rem
// text-base: 16px  | 1rem
// text-lg:   18px  | 1.125rem
// text-xl:   20px  | 1.25rem
// text-2xl:  24px  | 1.5rem
// text-3xl:  30px  | 1.875rem
// text-4xl:  36px  | 2.25rem
// text-5xl:  48px  | 3rem
// text-6xl:  60px  | 3.75rem
// text-7xl:  72px  | 4.5rem

// ============================================
// DISPLAY TYPOGRAPHY (Marketing/Heroes)
// Font: Plus Jakarta Sans
// ============================================

/**
 * Display text for marketing headlines and hero sections
 * @param {object} props
 * @param {'2xl' | 'xl' | 'lg' | 'md' | 'sm'} size - Display size
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children
 */
export const Display = ({ 
  size = 'lg', 
  as: Component = 'h1',
  className = '', 
  children,
  ...props 
}) => {
  const sizeClasses = {
    '2xl': 'text-7xl font-extrabold leading-none tracking-[-0.03em]',
    'xl': 'text-6xl font-extrabold leading-[1.1] tracking-[-0.02em]',
    'lg': 'text-5xl font-bold leading-[1.15] tracking-[-0.02em]',
    'md': 'text-4xl font-bold leading-[1.2] tracking-[-0.015em]',
    'sm': 'text-3xl font-bold leading-[1.25] tracking-[-0.01em]',
  };

  return (
    <Component
      className={`font-display ${sizeClasses[size]} text-slate-900 dark:text-slate-50 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// HEADING TYPOGRAPHY (UI/Content)
// Font: Inter
// ============================================

/**
 * Heading for section titles and content headers
 * @param {object} props
 * @param {1 | 2 | 3 | 4 | 5 | 6} level - Heading level (h1-h6)
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children
 */
export const Heading = ({ 
  level = 1, 
  as,
  className = '', 
  children,
  ...props 
}) => {
  const Tag = as || `h${level}`;
  
  const levelClasses = {
    1: 'text-3xl font-semibold leading-[1.25] tracking-[-0.01em]',
    2: 'text-2xl font-semibold leading-[1.25] tracking-[-0.01em]',
    3: 'text-xl font-semibold leading-[1.25]',
    4: 'text-lg font-semibold leading-normal',
    5: 'text-base font-semibold leading-normal',
    6: 'text-sm font-semibold leading-normal uppercase tracking-wide',
  };

  return (
    <Tag
      className={`font-sans ${levelClasses[level]} text-slate-900 dark:text-slate-50 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

// ============================================
// BODY TYPOGRAPHY
// ============================================

/**
 * Body text for paragraphs and general content
 * @param {object} props
 * @param {'xl' | 'lg' | 'md' | 'sm' | 'xs'} size - Text size
 * @param {'primary' | 'secondary' | 'muted' | 'subtle'} color - Text color
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children
 */
export const Text = ({ 
  size = 'md', 
  color = 'primary',
  as: Component = 'p',
  className = '', 
  children,
  ...props 
}) => {
  const sizeClasses = {
    'xl': 'text-xl leading-relaxed',
    'lg': 'text-lg leading-relaxed',
    'md': 'text-base leading-normal',
    'sm': 'text-sm leading-normal',
    'xs': 'text-xs leading-normal',
  };

  const colorClasses = {
    'primary': 'text-slate-900 dark:text-slate-50',
    'secondary': 'text-slate-700 dark:text-slate-300',
    'muted': 'text-slate-500 dark:text-slate-400',
    'subtle': 'text-slate-400 dark:text-slate-500',
    'brand': 'text-blue-600 dark:text-blue-400',
    'success': 'text-emerald-500',
    'warning': 'text-amber-500',
    'error': 'text-red-500',
  };

  return (
    <Component
      className={`font-sans font-normal ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// LEAD PARAGRAPH
// ============================================

/**
 * Lead paragraph for introductions and summaries
 */
export const Lead = ({ className = '', children, ...props }) => (
  <p
    className={`font-sans text-xl font-normal leading-relaxed text-slate-600 dark:text-slate-300 ${className}`}
    {...props}
  >
    {children}
  </p>
);

// ============================================
// SPECIAL TEXT STYLES
// ============================================

/**
 * Caption for images, tables, and footnotes
 */
export const Caption = ({ className = '', children, ...props }) => (
  <span
    className={`font-sans text-xs font-medium leading-normal text-slate-500 dark:text-slate-400 ${className}`}
    {...props}
  >
    {children}
  </span>
);

/**
 * Overline for category labels and metadata
 */
export const Overline = ({ className = '', children, ...props }) => (
  <span
    className={`font-sans text-xs font-semibold leading-normal uppercase tracking-wider text-slate-500 dark:text-slate-400 ${className}`}
    {...props}
  >
    {children}
  </span>
);

/**
 * Label for form fields
 */
export const Label = ({ 
  htmlFor,
  required = false,
  className = '', 
  children, 
  ...props 
}) => (
  <label
    htmlFor={htmlFor}
    className={`font-sans text-sm font-medium leading-normal text-slate-700 dark:text-slate-200 ${className}`}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

/**
 * Helper text for form hints
 */
export const HelperText = ({ className = '', children, ...props }) => (
  <span
    className={`font-sans text-xs font-normal leading-normal text-slate-500 dark:text-slate-400 ${className}`}
    {...props}
  >
    {children}
  </span>
);

/**
 * Error text for form validation
 */
export const ErrorText = ({ className = '', children, ...props }) => (
  <span
    className={`font-sans text-xs font-medium leading-normal text-red-500 ${className}`}
    {...props}
  >
    {children}
  </span>
);

// ============================================
// CODE / MONOSPACE TYPOGRAPHY
// Font: JetBrains Mono
// ============================================

/**
 * Inline code
 */
export const Code = ({ className = '', children, ...props }) => (
  <code
    className={`font-mono text-[0.875em] font-normal bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded ${className}`}
    {...props}
  >
    {children}
  </code>
);

/**
 * Code block
 */
export const CodeBlock = ({ className = '', children, ...props }) => (
  <pre
    className={`font-mono text-sm leading-relaxed bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto ${className}`}
    {...props}
  >
    <code>{children}</code>
  </pre>
);

/**
 * Data value display (for metrics/KPIs)
 * @param {'lg' | 'md' | 'sm'} size - Value size
 */
export const DataValue = ({ 
  size = 'md', 
  className = '', 
  children,
  ...props 
}) => {
  const sizeClasses = {
    'lg': 'text-5xl font-bold',
    'md': 'text-4xl font-semibold',
    'sm': 'text-2xl font-semibold',
  };

  return (
    <span
      className={`font-mono ${sizeClasses[size]} leading-none tracking-tight tabular-nums text-slate-900 dark:text-slate-50 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================
// FCI SPECIFIC TYPOGRAPHY
// ============================================

/**
 * FCI percentage value display
 * @param {number} value - FCI percentage
 * @param {'lg' | 'md' | 'sm'} size - Display size
 */
export const FCIValue = ({ 
  value, 
  size = 'md', 
  showPercent = true,
  className = '', 
  ...props 
}) => {
  const getColor = (fci) => {
    if (fci <= 5) return 'text-emerald-500';
    if (fci <= 10) return 'text-amber-500';
    if (fci <= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const sizeClasses = {
    'lg': 'text-5xl font-bold',
    'md': 'text-3xl font-bold',
    'sm': 'text-xl font-semibold',
  };

  return (
    <span
      className={`font-mono ${sizeClasses[size]} leading-none tabular-nums ${getColor(value)} ${className}`}
      {...props}
    >
      {value.toFixed(1)}{showPercent && '%'}
    </span>
  );
};

/**
 * FCI condition label
 * @param {number} value - FCI percentage
 */
export const FCILabel = ({ value, className = '', ...props }) => {
  const getLabel = (fci) => {
    if (fci <= 5) return { text: 'Good', color: 'text-emerald-500' };
    if (fci <= 10) return { text: 'Fair', color: 'text-amber-500' };
    if (fci <= 30) return { text: 'Poor', color: 'text-orange-500' };
    return { text: 'Critical', color: 'text-red-500' };
  };

  const { text, color } = getLabel(value);

  return (
    <span
      className={`font-sans text-xs font-semibold uppercase tracking-wide ${color} ${className}`}
      {...props}
    >
      {text}
    </span>
  );
};

// ============================================
// LINK COMPONENTS
// ============================================

/**
 * Standard link
 */
export const Link = ({ 
  href,
  external = false,
  variant = 'default',
  className = '', 
  children,
  ...props 
}) => {
  const variantClasses = {
    'default': 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline',
    'subtle': 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline',
    'muted': 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
  };

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`font-sans transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
      {external && (
        <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </a>
  );
};

// ============================================
// BADGE / TAG TEXT
// ============================================

/**
 * Badge text (for use inside badge components)
 */
export const BadgeText = ({ className = '', children, ...props }) => (
  <span
    className={`font-sans text-xs font-medium leading-none tracking-wide ${className}`}
    {...props}
  >
    {children}
  </span>
);

// ============================================
// LIST TYPOGRAPHY
// ============================================

/**
 * Unordered list with proper typography
 */
export const List = ({ 
  ordered = false,
  className = '', 
  children,
  ...props 
}) => {
  const Tag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'list-decimal' : 'list-disc';

  return (
    <Tag
      className={`font-sans text-base leading-normal text-slate-700 dark:text-slate-300 ${listClass} pl-5 space-y-2 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

/**
 * List item
 */
export const ListItem = ({ className = '', children, ...props }) => (
  <li className={`${className}`} {...props}>
    {children}
  </li>
);

// ============================================
// BLOCKQUOTE
// ============================================

/**
 * Blockquote for quotations
 */
export const Blockquote = ({ className = '', children, ...props }) => (
  <blockquote
    className={`font-sans text-lg italic leading-relaxed text-slate-600 dark:text-slate-300 border-l-4 border-blue-500 pl-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </blockquote>
);

// ============================================
// TYPOGRAPHY SCALE PREVIEW COMPONENT
// ============================================

/**
 * Preview component showing the complete type scale
 * Useful for development and documentation
 */
export const TypographyPreview = () => (
  <div className="space-y-8 p-8">
    <section>
      <Overline className="mb-4">Display (Plus Jakarta Sans)</Overline>
      <div className="space-y-4">
        <Display size="2xl">Display 2XL - 72px</Display>
        <Display size="xl">Display XL - 60px</Display>
        <Display size="lg">Display LG - 48px</Display>
        <Display size="md">Display MD - 36px</Display>
        <Display size="sm">Display SM - 30px</Display>
      </div>
    </section>

    <section>
      <Overline className="mb-4">Headings (Inter)</Overline>
      <div className="space-y-3">
        <Heading level={1}>Heading 1 - 30px</Heading>
        <Heading level={2}>Heading 2 - 24px</Heading>
        <Heading level={3}>Heading 3 - 20px</Heading>
        <Heading level={4}>Heading 4 - 18px</Heading>
        <Heading level={5}>Heading 5 - 16px</Heading>
        <Heading level={6}>Heading 6 - 14px UPPERCASE</Heading>
      </div>
    </section>

    <section>
      <Overline className="mb-4">Body Text</Overline>
      <div className="space-y-3">
        <Lead>Lead paragraph - 20px with relaxed line height for introductions.</Lead>
        <Text size="xl">Body XL - 20px paragraph text</Text>
        <Text size="lg">Body LG - 18px paragraph text</Text>
        <Text size="md">Body MD - 16px default paragraph text</Text>
        <Text size="sm">Body SM - 14px secondary text</Text>
        <Text size="xs">Body XS - 12px caption text</Text>
      </div>
    </section>

    <section>
      <Overline className="mb-4">Special Styles</Overline>
      <div className="space-y-3">
        <div><Label>Form Label</Label></div>
        <div><Caption>Caption text for images</Caption></div>
        <div><HelperText>Helper text for form fields</HelperText></div>
        <div><ErrorText>Error message text</ErrorText></div>
        <div><Overline>Overline / Category Label</Overline></div>
      </div>
    </section>

    <section>
      <Overline className="mb-4">Code (JetBrains Mono)</Overline>
      <div className="space-y-3">
        <Text>Inline <Code>code snippet</Code> within text</Text>
        <CodeBlock>{`const fci = deferredMaintenance / replacementValue;`}</CodeBlock>
      </div>
    </section>

    <section>
      <Overline className="mb-4">Data Values</Overline>
      <div className="space-y-3 flex gap-8 items-end">
        <div>
          <Caption className="block mb-1">Large</Caption>
          <DataValue size="lg">$2.4M</DataValue>
        </div>
        <div>
          <Caption className="block mb-1">Medium</Caption>
          <DataValue size="md">127</DataValue>
        </div>
        <div>
          <Caption className="block mb-1">Small</Caption>
          <DataValue size="sm">42%</DataValue>
        </div>
      </div>
    </section>

    <section>
      <Overline className="mb-4">FCI Display</Overline>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <FCIValue value={3.2} size="lg" />
          <FCILabel value={3.2} />
        </div>
        <div className="flex items-center gap-4">
          <FCIValue value={7.8} size="md" />
          <FCILabel value={7.8} />
        </div>
        <div className="flex items-center gap-4">
          <FCIValue value={18.5} size="sm" />
          <FCILabel value={18.5} />
        </div>
        <div className="flex items-center gap-4">
          <FCIValue value={42.1} size="sm" />
          <FCILabel value={42.1} />
        </div>
      </div>
    </section>
  </div>
);

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  Display,
  Heading,
  Text,
  Lead,
  Caption,
  Overline,
  Label,
  HelperText,
  ErrorText,
  Code,
  CodeBlock,
  DataValue,
  FCIValue,
  FCILabel,
  Link,
  BadgeText,
  List,
  ListItem,
  Blockquote,
  TypographyPreview,
};
