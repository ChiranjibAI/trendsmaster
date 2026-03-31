export const API_BASE = import.meta.env.VITE_API_URL || 'http://187.77.185.34:8001';
export const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://187.77.185.34:8001';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌐', color: 'purple' },
  { id: 'ai', label: 'AI & ML', icon: '🤖', color: 'violet' },
  { id: 'tech', label: 'Tech', icon: '⚡', color: 'blue' },
  { id: 'dev', label: 'Dev', icon: '💻', color: 'cyan' },
  { id: 'crypto', label: 'Crypto', icon: '₿', color: 'orange' },
  { id: 'world', label: 'World', icon: '🌍', color: 'red' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'green' },
];

export const SOURCE_META = {
  twitter:      { icon: '🐦', label: 'Twitter/X',    color: 'sky' },
  hackernews:   { icon: '🔺', label: 'HackerNews',   color: 'orange' },
  reddit:       { icon: '👽', label: 'Reddit',        color: 'red' },
  github:       { icon: '🐙', label: 'GitHub',        color: 'slate' },
  techcrunch:   { icon: '📰', label: 'TechCrunch',    color: 'green' },
  theverge:     { icon: '📺', label: 'The Verge',     color: 'pink' },
  arstechnica:  { icon: '🔬', label: 'Ars Technica',  color: 'indigo' },
  producthunt:  { icon: '🚀', label: 'Product Hunt',  color: 'rose' },
  devto:        { icon: '👩‍💻', label: 'DEV.to',       color: 'violet' },
  lobsters:     { icon: '🦞', label: 'Lobsters',      color: 'red' },
  youtube:      { icon: '▶️', label: 'YouTube',        color: 'red' },
  default:      { icon: '📡', label: 'Web',           color: 'slate' },
};

export const CAT_COLORS = {
  ai:      'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  crypto:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  dev:     'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  world:   'bg-red-500/10 text-red-400 border border-red-500/20',
  science: 'bg-green-500/10 text-green-400 border border-green-500/20',
  tech:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  all:     'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};
