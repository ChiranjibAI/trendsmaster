import { useState, useCallback, useEffect, useRef } from 'react';
import { useFeed, useStats, useTrending, useSources, useWebSocket } from './hooks/useApi';
import { Search, RefreshCw, Maximize2, ChevronDown, Zap, Globe, TrendingUp, Cpu, Bitcoin, Code2, FlaskConical, ExternalLink, Share2, ArrowUp, MessageSquare, Sun, Moon, X } from 'lucide-react';
import { API_BASE } from './config';

// ── UTILS ──────────────────────────────────────────────────────────────────
const timeAgo = (ts) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

// ── SOURCE META ─────────────────────────────────────────────────────────────
const SRC = {
  twitter:     { icon: '𝕏', color: '#1d9bf0', label: 'Twitter/X' },
  hackernews:  { icon: 'Y', color: '#ff6600', label: 'HackerNews' },
  reddit:      { icon: '⬆', color: '#ff4500', label: 'Reddit' },
  github:      { icon: '⌥', color: '#7ee787', label: 'GitHub' },
  techcrunch:  { icon: 'TC', color: '#0a7c59', label: 'TechCrunch' },
  theverge:    { icon: 'V', color: '#e040fb', label: 'The Verge' },
  arstechnica: { icon: 'Ars', color: '#ff6600', label: 'ArsTechnica' },
  producthunt: { icon: '▶', color: '#da552f', label: 'ProductHunt' },
  devto:       { icon: 'DEV', color: '#3b49df', label: 'DEV.to' },
  lobsters:    { icon: '🦞', color: '#ac130d', label: 'Lobsters' },
  default:     { icon: '◉', color: '#64748b', label: 'Web' },
};

const CAT = {
  all:     { label: 'ALL FEEDS', icon: <Globe className="w-3 h-3" />, accent: '#a78bfa' },
  ai:      { label: 'AI & ML', icon: <Cpu className="w-3 h-3" />, accent: '#a78bfa' },
  tech:    { label: 'TECH', icon: <Zap className="w-3 h-3" />, accent: '#60a5fa' },
  dev:     { label: 'DEV', icon: <Code2 className="w-3 h-3" />, accent: '#34d399' },
  crypto:  { label: 'CRYPTO', icon: <Bitcoin className="w-3 h-3" />, accent: '#fb923c' },
  world:   { label: 'WORLD', icon: <Globe className="w-3 h-3" />, accent: '#f87171' },
  science: { label: 'SCIENCE', icon: <FlaskConical className="w-3 h-3" />, accent: '#4ade80' },
};

const CAT_BADGE = {
  ai:      'text-violet-400 bg-violet-900/30 border-violet-800/50',
  crypto:  'text-orange-400 bg-orange-900/30 border-orange-800/50',
  dev:     'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
  world:   'text-red-400 bg-red-900/30 border-red-800/50',
  science: 'text-green-400 bg-green-900/30 border-green-800/50',
  tech:    'text-blue-400 bg-blue-900/30 border-blue-800/50',
};

// ── CLOCK ──────────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="font-mono text-xs text-emerald-400/80 tracking-widest">
      {t.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')} UTC
    </span>
  );
}

// ── FEED CARD ─────────────────────────────────────────────────────────────
function FeedCard({ item, compact = false }) {
  const srcBase = item.source?.split('/')[0] || 'default';
  const src = SRC[srcBase] || SRC.default;
  const badge = CAT_BADGE[item.category] || CAT_BADGE.tech;

  return (
    <div
      onClick={() => window.open(item.url || '#', '_blank', 'noopener')}
      className="group cursor-pointer border border-gray-800/60 hover:border-gray-600/60 bg-gray-900/40 hover:bg-gray-800/60 rounded-lg transition-all duration-150"
    >
      {!compact && item.image && (
        <div className="h-28 bg-gray-800 rounded-t-lg overflow-hidden">
          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" onError={e => { e.target.parentElement.style.display = 'none'; }} />
        </div>
      )}
      <div className={compact ? 'px-3 py-2' : 'p-3'}>
        {/* Top row */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: src.color, background: src.color + '15' }}>
            {src.icon}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded border font-mono uppercase tracking-wide ${badge}`}>
            {item.category || 'tech'}
          </span>
          <span className="ml-auto font-mono text-xs text-gray-600">{timeAgo(item.timestamp || 0)}</span>
        </div>

        {/* Title */}
        <p className={`font-medium leading-snug text-gray-200 group-hover:text-white transition-colors ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
          {item.title || ''}
        </p>

        {/* Stats */}
        {!compact && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            {item.score > 0 && <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3 text-emerald-600" />{fmtNum(item.score)}</span>}
            {item.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{fmtNum(item.comments)}</span>}
            {item.author && <span className="ml-auto truncate max-w-32 text-gray-700">{item.author}</span>}
            <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── SOURCE TABS ────────────────────────────────────────────────────────────
function SourceTabs({ active, onChange, sources }) {
  const mainSources = ['all', 'twitter', 'hackernews', 'reddit', 'github', 'techcrunch', 'theverge', 'producthunt', 'devto'];
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
      {mainSources.map(s => {
        const meta = s === 'all' ? { icon: '◉', color: '#a78bfa', label: 'ALL' } : (SRC[s] || SRC.default);
        const isActive = active === s;
        return (
          <button key={s} onClick={() => onChange(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              isActive ? 'text-black' : 'text-gray-500 hover:text-gray-300 bg-transparent hover:bg-gray-800/50'
            }`}
            style={isActive ? { background: meta.color, color: '#000' } : {}}>
            <span>{meta.icon}</span>
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CATEGORY TABS ──────────────────────────────────────────────────────────
function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
      {Object.entries(CAT).map(([id, c]) => (
        <button key={id} onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
            active === id
              ? 'text-white border-current'
              : 'text-gray-600 border-transparent hover:text-gray-400 hover:border-gray-700'
          }`}
          style={active === id ? { color: c.accent, borderColor: c.accent } : {}}>
          {c.icon}
          <span className="hidden sm:inline">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── PANEL HEADER ─────────────────────────────────────────────────────────
function PanelHeader({ title, count, live = false, actions }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/60">
      <div className="flex items-center gap-2">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        <span className="font-mono text-xs font-bold tracking-widest text-gray-300 uppercase">{title}</span>
        {count !== undefined && (
          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-gray-800 text-emerald-400">
            ● {count}
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">{actions}</div>
    </div>
  );
}

// ── TRENDING PANEL ────────────────────────────────────────────────────────
function TrendingPanel({ words }) {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="TRENDING SIGNALS" count={words.length} live />
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {words.slice(0, 30).map((w, i) => (
          <div key={w.word} className="flex items-center gap-2 group">
            <span className="font-mono text-xs text-gray-700 w-5 text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-gray-300 group-hover:text-emerald-400 transition-colors truncate">{w.word.toUpperCase()}</span>
                <span className="font-mono text-xs text-gray-700 shrink-0 ml-2">{w.count}</span>
              </div>
              <div className="mt-0.5 h-px bg-gray-800">
                <div className="h-px bg-emerald-500/60 transition-all" style={{ width: `${Math.min(100, (w.count / (words[0]?.count || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI INSIGHTS PANEL ─────────────────────────────────────────────────────
function InsightsPanel({ items, stats }) {
  const topAI = items.filter(i => i.category === 'ai').slice(0, 5);
  const topCrypto = items.filter(i => i.category === 'crypto').slice(0, 3);
  const topDev = items.filter(i => i.category === 'dev').slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="SIGNAL BRIEF" live actions={
        <span className="font-mono text-xs px-2 py-0.5 rounded border border-emerald-800/50 text-emerald-400 bg-emerald-900/20">LIVE</span>
      } />
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'TOTAL', value: stats?.total?.toLocaleString() || '—', color: '#a78bfa' },
            { label: 'TODAY', value: stats?.today?.toLocaleString() || '—', color: '#34d399' },
            { label: 'SOURCES', value: Object.keys(stats?.per_source || {}).length || '—', color: '#60a5fa' },
            { label: 'ONLINE', value: (stats?.live_clients || 0) + 1, color: '#fb923c' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800/40 rounded p-2">
              <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">{s.label}</p>
              <p className="font-mono text-lg font-black mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top AI */}
        {topAI.length > 0 && (
          <div>
            <p className="font-mono text-xs text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> AI SIGNALS
            </p>
            <div className="space-y-1.5">
              {topAI.map(item => (
                <div key={item.id} onClick={() => window.open(item.url, '_blank')}
                  className="cursor-pointer group p-2 rounded bg-gray-900/40 border border-gray-800/40 hover:border-violet-800/50 transition-all">
                  <p className="text-xs text-gray-300 group-hover:text-white line-clamp-2 leading-relaxed">{item.title}</p>
                  <p className="font-mono text-xs text-gray-700 mt-1">{timeAgo(item.timestamp)} ago · {item.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Crypto */}
        {topCrypto.length > 0 && (
          <div>
            <p className="font-mono text-xs text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Bitcoin className="w-3 h-3" /> CRYPTO SIGNALS
            </p>
            <div className="space-y-1.5">
              {topCrypto.map(item => (
                <div key={item.id} onClick={() => window.open(item.url, '_blank')}
                  className="cursor-pointer group p-2 rounded bg-gray-900/40 border border-gray-800/40 hover:border-orange-800/50 transition-all">
                  <p className="text-xs text-gray-300 group-hover:text-white line-clamp-2 leading-relaxed">{item.title}</p>
                  <p className="font-mono text-xs text-gray-700 mt-1">{timeAgo(item.timestamp)} ago · {item.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source breakdown */}
        {stats?.per_source && (
          <div>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">SOURCE BREAKDOWN</p>
            <div className="space-y-1">
              {Object.entries(stats.per_source).sort((a,b) => b[1]-a[1]).map(([src, count]) => {
                const meta = SRC[src.split('/')[0]] || SRC.default;
                const max = Math.max(...Object.values(stats.per_source));
                return (
                  <div key={src} className="flex items-center gap-2">
                    <span className="font-mono text-xs shrink-0 w-24 truncate text-gray-600">{src.replace('reddit/r/', 'r/')}</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-1 rounded-full" style={{ width: `${(count/max)*100}%`, background: meta.color + '80' }} />
                    </div>
                    <span className="font-mono text-xs text-gray-600 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pendingNew, setPendingNew] = useState(0);
  const [toasts, setToasts] = useState([]);

  const { items, loading, hasMore, loadMore, reload } = useFeed(category, source, search);
  const stats = useStats();
  const trending = useTrending();
  const sources = useSources();

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // WebSocket
  const handleWs = useCallback((msg) => {
    if (msg.type === 'new_items') {
      setPendingNew(n => n + msg.count);
      const id = Date.now();
      setToasts(t => [...t, { id, msg: `🔥 ${msg.count} new signals incoming` }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    }
  }, []);
  useWebSocket(handleWs);

  // Dark mode
  useEffect(() => {
    document.body.style.background = dark ? '#080b10' : '#f0f4f8';
    document.body.style.color = dark ? '#e2e8f0' : '#1e293b';
  }, [dark]);

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: dark ? '#080b10' : '#f0f4f8' }}>

      {/* ── TOP BAR ── */}
      <header style={{ background: dark ? '#0d1117' : '#1e293b', borderBottom: '1px solid #1f2937', height: '44px' }}
        className="flex items-center px-4 gap-4 shrink-0 z-50">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="font-black text-xs text-black">T</span>
          </div>
          <span className="font-mono font-black text-sm tracking-wider text-white">TRENDSMASTER</span>
          <span className="font-mono text-xs text-gray-600">v1.0</span>
        </div>

        {/* Live dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-emerald-400 font-bold">LIVE</span>
        </div>

        {/* Clock */}
        <LiveClock />

        {/* Category tabs */}
        <div className="flex-1 overflow-hidden">
          <CategoryTabs active={category} onChange={c => { setCategory(c); setSource('all'); }} />
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="SEARCH..."
            className="w-full pl-7 pr-3 py-1.5 font-mono text-xs bg-gray-800/60 border border-gray-700/40 rounded text-gray-300 placeholder-gray-700 focus:outline-none focus:border-emerald-600/60 tracking-wider"
          />
        </div>

        {/* Stats chip */}
        {stats && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-gray-500">{stats.total?.toLocaleString()} <span className="text-gray-700">ITEMS</span></span>
            <span className="font-mono text-xs text-emerald-500">{stats.today} <span className="text-gray-700">TODAY</span></span>
          </div>
        )}

        {/* New badge */}
        {pendingNew > 0 && (
          <button onClick={() => { setPendingNew(0); reload(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 transition-all shrink-0">
            <Zap className="w-3 h-3" />{pendingNew} NEW
          </button>
        )}

        {/* By Chiranjib */}
        <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
          className="hidden lg:block font-mono text-xs text-gray-600 hover:text-emerald-400 transition-colors shrink-0">
          BY <span className="text-gray-400">CHIRANJIB.XYZ</span>
        </a>

        {/* Theme */}
        <button onClick={() => setDark(d => !d)} className="p-1.5 rounded hover:bg-gray-800 transition-all shrink-0">
          {dark ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
        </button>
      </header>

      {/* ── SOURCE TABS ROW ── */}
      <div style={{ background: dark ? '#0a0e15' : '#1a2232', borderBottom: '1px solid #1f2937', height: '36px' }}
        className="flex items-center px-4 shrink-0">
        <SourceTabs active={source} onChange={setSource} sources={sources} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={reload} className="flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-gray-300 transition-colors">
            <RefreshCw className="w-3 h-3" /> REFRESH
          </button>
        </div>
      </div>

      {/* ── MAIN PANELS ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* FEED PANEL - main */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: '1px solid #1f2937' }}>
          <PanelHeader title="LIVE FEED" count={items.length} live actions={
            <span className="font-mono text-xs text-gray-600">{category.toUpperCase()} · {source.toUpperCase()}</span>
          } />
          <div className="flex-1 overflow-y-auto p-3">
            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <div className="font-mono text-xs animate-pulse tracking-widest">LOADING SIGNALS...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-700">
                <p className="font-mono text-xs tracking-widest">NO SIGNALS FOUND</p>
              </div>
            ) : (
              <>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map(item => <FeedCard key={item.id} item={item} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <button onClick={loadMore}
                      className="font-mono text-xs px-4 py-2 rounded border border-gray-800 text-gray-600 hover:border-emerald-800 hover:text-emerald-400 transition-all tracking-wider">
                      LOAD MORE ↓
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANELS */}
        <div className="hidden lg:flex flex-col" style={{ width: '240px', borderRight: '1px solid #1f2937' }}>
          {/* Trending - top half */}
          <div className="flex flex-col" style={{ height: '50%', borderBottom: '1px solid #1f2937' }}>
            <TrendingPanel words={trending} />
          </div>
          {/* Insights - bottom half */}
          <div className="flex flex-col" style={{ height: '50%' }}>
            <InsightsPanel items={items} stats={stats} />
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div style={{ background: dark ? '#0d1117' : '#1e293b', borderTop: '1px solid #1f2937', height: '24px' }}
        className="flex items-center px-4 gap-6 shrink-0">
        <span className="font-mono text-xs text-gray-700">TRENDSMASTER · BY CHIRANJIB.XYZ</span>
        <span className="font-mono text-xs text-gray-700">|</span>
        <span className="font-mono text-xs text-emerald-600/60">● SYSTEM NOMINAL</span>
        <span className="font-mono text-xs text-gray-700">|</span>
        <span className="font-mono text-xs text-gray-700">{stats?.total || 0} TOTAL SIGNALS</span>
        <span className="font-mono text-xs text-gray-700">|</span>
        <span className="font-mono text-xs text-gray-700">{Object.keys(stats?.per_source || {}).length} ACTIVE SOURCES</span>
        <div className="ml-auto">
          <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-gray-700 hover:text-emerald-500 transition-colors">
            CHIRANJIB.XYZ →
          </a>
        </div>
      </div>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-8 right-4 z-50 space-y-1.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="toast-enter font-mono text-xs px-4 py-2 rounded border border-emerald-800/60 bg-gray-900/95 text-emerald-400 shadow-xl">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
