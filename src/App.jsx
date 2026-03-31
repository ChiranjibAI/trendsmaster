import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, ArrowUpRight, TrendingUp, Cpu, Globe,
  Code2, Bitcoin, FlaskConical, Zap, BarChart2, Sun, Moon,
  ChevronRight, ArrowUp, MessageSquare, Clock
} from 'lucide-react';
import { useFeed, useStats, useTrending, useSources, useWebSocket, useAiBrief } from './hooks/useApi';

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const SOURCE = {
  twitter:     { label: 'X / Twitter',  badge: 'X',   color: '#1d9bf0' },
  hackernews:  { label: 'Hacker News',  badge: 'HN',  color: '#ff6600' },
  reddit:      { label: 'Reddit',       badge: 'Re',  color: '#ff4500' },
  github:      { label: 'GitHub',       badge: 'GH',  color: '#7ee787' },
  techcrunch:  { label: 'TechCrunch',   badge: 'TC',  color: '#00a86b' },
  theverge:    { label: 'The Verge',    badge: 'TV',  color: '#e040fb' },
  arstechnica: { label: 'Ars Technica', badge: 'Ars', color: '#ff8c00' },
  producthunt: { label: 'Product Hunt', badge: 'PH',  color: '#da552f' },
  devto:       { label: 'DEV.to',       badge: 'Dev', color: '#3b49df' },
  lobsters:    { label: 'Lobsters',     badge: 'Lb',  color: '#ac130d' },
  youtube:     { label: 'YouTube',      badge: 'YT',  color: '#ff0000' },
  default:     { label: 'Web',          badge: '~',   color: '#71717a' },
};

const CAT = [
  { id: 'all',     label: 'All Feeds', Icon: Globe },
  { id: 'ai',      label: 'AI & ML',   Icon: Cpu },
  { id: 'tech',    label: 'Tech',      Icon: Zap },
  { id: 'dev',     label: 'Dev',       Icon: Code2 },
  { id: 'crypto',  label: 'Crypto',    Icon: Bitcoin },
  { id: 'world',   label: 'World',     Icon: Globe },
  { id: 'science', label: 'Science',   Icon: FlaskConical },
];

const CAT_ACCENT = {
  ai: '#a78bfa', tech: '#60a5fa', dev: '#34d399',
  crypto: '#fb923c', world: '#f87171', science: '#4ade80', all: '#10b981',
};

const CAT_TAG = {
  ai:      'text-violet-400 bg-violet-500/10 ring-violet-500/20',
  tech:    'text-blue-400   bg-blue-500/10   ring-blue-500/20',
  dev:     'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  crypto:  'text-orange-400 bg-orange-500/10 ring-orange-500/20',
  world:   'text-red-400    bg-red-500/10    ring-red-500/20',
  science: 'text-green-400  bg-green-500/10  ring-green-500/20',
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const timeAgo = (ts) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400)return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};
const num = (n) => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);

// ─── SPOTLIGHT CARD (mouse-tracking glow) ────────────────────────────────────
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-[10px] border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton w-8 h-5 rounded" />
        <div className="skeleton w-14 h-5 rounded" />
        <div className="skeleton w-8 h-5 rounded ml-auto" />
      </div>
      <div className="skeleton w-full h-4 rounded" />
      <div className="skeleton w-4/5 h-4 rounded" />
      <div className="skeleton w-3/5 h-3 rounded mt-1" />
    </div>
  );
}

// ─── FEED CARD ───────────────────────────────────────────────────────────────
function FeedCard({ item, index = 0 }) {
  const srcKey = item.source?.split('/')[0] || 'default';
  const src    = SOURCE[srcKey] || SOURCE.default;
  const tag    = CAT_TAG[item.category] || CAT_TAG.tech;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.16,1,0.3,1] }}
    >
      <SpotlightCard>
        <button
          className="w-full text-left p-4 group"
          onClick={() => window.open(item.url || '#', '_blank', 'noopener')}
        >
          {/* Row 1 — source badge + category + time */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: src.color, background: src.color + '18' }}
            >
              {src.badge}
            </span>
            {item.category && (
              <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ${tag}`}>
                {item.category.toUpperCase()}
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] text-zinc-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(item.timestamp || 0)}
            </span>
          </div>

          {/* Row 2 — title */}
          <p className="text-sm font-medium leading-snug text-zinc-200 group-hover:text-white transition-colors line-clamp-3 mb-3">
            {item.title}
          </p>

          {/* Row 3 — metadata */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-600">
            {item.score  > 0 && (
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-zinc-500" />
                {num(item.score)}
              </span>
            )}
            {item.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {num(item.comments)}
              </span>
            )}
            {item.author && (
              <span className="ml-auto truncate max-w-[120px] text-zinc-700">{item.author}</span>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
          </div>
        </button>
      </SpotlightCard>
    </motion.div>
  );
}

// ─── LIVE CLOCK ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <span className="font-mono text-[11px] text-zinc-500 tracking-widest tabular-nums">
      {pad(t.getUTCHours())}:{pad(t.getUTCMinutes())}:{pad(t.getUTCSeconds())} UTC
    </span>
  );
}

// ─── TRENDING PANEL ──────────────────────────────────────────────────────────
function TrendingPanel({ words }) {
  const max = words[0]?.count || 1;
  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
        <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Trending Signals</span>
        <span className="ml-auto font-mono text-[10px] text-emerald-500 font-bold">{words.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {words.slice(0, 28).map((w, i) => (
          <motion.div
            key={w.word}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/40 transition-colors group cursor-default"
          >
            <span className="font-mono text-[10px] text-zinc-700 w-4 text-right tabular-nums shrink-0">{i+1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-zinc-300 group-hover:text-emerald-400 transition-colors uppercase tracking-wide">
                  {w.word}
                </span>
                <span className="font-mono text-[10px] text-zinc-700 tabular-nums">{w.count}</span>
              </div>
              <div className="h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                <div className="bar-fill" style={{ width: `${(w.count/max)*100}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── SIGNAL BRIEF PANEL ──────────────────────────────────────────────────────
function SignalBrief({ items, stats, brief, briefLoading }) {
  const topAI = items.filter(x => x.category === 'ai').slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <BarChart2 className="w-3.5 h-3.5 text-zinc-500" />
        <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Signal Brief</span>
        <span className="ml-auto flex items-center gap-1.5">
          <div className="live-dot" />
          <span className="font-mono text-[10px] text-emerald-400 font-bold">LIVE</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { k: 'TOTAL',   v: stats?.total?.toLocaleString(), color: '#a78bfa' },
            { k: 'TODAY',   v: stats?.today?.toLocaleString(), color: '#10b981' },
            { k: 'SOURCES', v: Object.keys(stats?.per_source||{}).length, color: '#60a5fa' },
            { k: 'LIVE',    v: (stats?.live_clients||0)+1,               color: '#fb923c' },
          ].map(m => (
            <div key={m.k} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{m.k}</p>
              <p className="font-mono text-lg font-black tabular-nums mt-0.5 leading-none" style={{ color: m.color }}>
                {m.v ?? '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800/40" />

        {/* AI Brief — Local LLM powered */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Cpu className="w-3 h-3 text-violet-400" />
            <span className="font-mono text-[10px] text-violet-400 uppercase tracking-widest font-bold">AI Brief</span>
            <span className="ml-auto font-mono text-[9px] text-zinc-700">llama3.2</span>
          </div>

          {briefLoading ? (
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
            </div>
          ) : brief?.summary ? (
            <div className="space-y-3">
              {/* Main summary */}
              <div className="p-2.5 rounded-lg border border-violet-900/30 bg-violet-950/20">
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  {brief.summary.replace(/^Here is[^:]*:\n\n?/i, '')}
                </p>
                {brief.age > 0 && (
                  <p className="font-mono text-[9px] text-zinc-700 mt-1.5">
                    generated {Math.floor(brief.age / 60)}m ago · {brief.stale ? 'refreshing...' : 'cached'}
                  </p>
                )}
              </div>

              {/* Category briefs */}
              {Object.entries(brief.categories || {}).map(([cat, text]) => text && (
                <div key={cat} className="p-2 rounded-lg border border-zinc-800/30 bg-zinc-900/20">
                  <p className={`font-mono text-[9px] uppercase tracking-widest mb-1 ${
                    cat === 'ai' ? 'text-violet-500' : cat === 'tech' ? 'text-blue-500' :
                    cat === 'crypto' ? 'text-orange-500' : 'text-emerald-500'
                  }`}>{cat}</p>
                  <p className="text-[10px] leading-relaxed text-zinc-500">
                    {text.replace(/^Here is[^:]*:\n\n?/i, '').replace(/^In one sentence[^:]*:\n\n?/i, '')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-zinc-800/30 bg-zinc-900/20">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="live-dot" />
                <p className="font-mono text-[10px] text-zinc-500">Generating brief...</p>
              </div>
              <p className="text-[10px] text-zinc-700">Local LLM analyzing {stats?.today || 0} signals</p>
            </div>
          )}
        </div>

        {/* Source breakdown */}
        {stats?.per_source && (
          <>
            <div className="border-t border-zinc-800/40" />
            <div>
              <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-bold">By Source</span>
              <div className="mt-2 space-y-1.5">
                {Object.entries(stats.per_source)
                  .sort((a,b) => b[1]-a[1])
                  .map(([src, count]) => {
                    const meta = SOURCE[src.split('/')[0]] || SOURCE.default;
                    const pct  = (count / Math.max(...Object.values(stats.per_source))) * 100;
                    return (
                      <div key={src} className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-600 w-20 truncate">
                          {src.replace('reddit/r/','r/')}
                        </span>
                        <div className="flex-1 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: meta.color + 'bb' }} />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-700 w-5 text-right tabular-nums">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SOURCE PILL TABS ────────────────────────────────────────────────────────
function SourceTabs({ active, onChange }) {
  const tabs = [
    { id: 'all', label: 'All', color: '#10b981' },
    ...Object.entries(SOURCE)
      .filter(([k]) => k !== 'default')
      .map(([id, m]) => ({ id, label: m.badge, color: m.color })),
  ];
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scroll">
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(t.id)}
            className="font-mono text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest whitespace-nowrap transition-all"
            style={on
              ? { background: t.color + '20', color: t.color, outline: `1px solid ${t.color}40` }
              : { color: '#52525b' }
            }
          >
            {t.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── CATEGORY NAV ────────────────────────────────────────────────────────────
function CategoryNav({ active, onChange }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto no-scroll">
      {CAT.map(({ id, label, Icon }) => {
        const on = active === id;
        const ac = CAT_ACCENT[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs font-medium whitespace-nowrap transition-all border-b-2 rounded-t-sm"
            style={on
              ? { color: ac, borderColor: ac }
              : { color: '#52525b', borderColor: 'transparent' }
            }
          >
            <Icon className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-emerald-800/50 bg-zinc-900/95 shadow-lg"
    >
      <div className="live-dot shrink-0" />
      <span className="text-xs text-emerald-400 font-medium">{msg}</span>
    </motion.div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
        <Search className="w-5 h-5 text-zinc-700" />
      </div>
      <p className="font-medium text-zinc-400 mb-1">No signals found</p>
      <p className="text-sm text-zinc-600">
        {search ? `No results for "${search}"` : 'Try a different category or source'}
      </p>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const [dark]         = useState(true);
  const [category, setCategory] = useState('all');
  const [source, setSource]     = useState('all');
  const [searchQ, setSearchQ]   = useState('');
  const [searchI, setSearchI]   = useState('');
  const [pendingNew, setPending] = useState(0);
  const [toasts, setToasts]     = useState([]);

  const { items, loading, hasMore, loadMore, reload } = useFeed(category, source, searchQ);
  const stats    = useStats();
  const trending = useTrending();
  const { brief, loading: briefLoading } = useAiBrief();

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQ(searchI), 450);
    return () => clearTimeout(t);
  }, [searchI]);

  // WebSocket live
  const onWs = useCallback((msg) => {
    if (msg.type === 'new_items') {
      setPending(n => n + msg.count);
      const id = Date.now();
      setToasts(t => [...t, { id, msg: `${msg.count} new signals detected` }]);
    }
  }, []);
  useWebSocket(onWs);

  return (
    <div
      className="flex flex-col"
      style={{ height: '100svh', overflow: 'hidden', background: '#09090b', color: '#fafafa' }}
    >
      {/* ── TOPBAR ───────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-5 shrink-0"
        style={{ height: 48, background: '#111113', borderBottom: '1px solid #1c1c1f' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #0284c7)' }}>
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white">TrendsMaster</span>
            <span className="font-mono text-[9px] text-zinc-600 hidden sm:inline">v1.0</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="live-dot" />
          <span className="font-mono text-[10px] text-emerald-400 font-bold tracking-widest">LIVE</span>
        </div>

        <LiveClock />

        {/* Category nav — center */}
        <div className="flex-1 overflow-hidden">
          <CategoryNav active={category} onChange={c => { setCategory(c); setSource('all'); }} />
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-44 hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
          <input
            value={searchI}
            onChange={e => setSearchI(e.target.value)}
            placeholder="Search signals..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] font-medium bg-zinc-800/50 border border-zinc-700/40 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-600/40 transition-colors"
          />
        </div>

        {/* Stats */}
        {stats && (
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="font-mono text-[13px] font-black text-white tabular-nums">{stats.total?.toLocaleString()}</p>
              <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">Items</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[13px] font-black text-emerald-400 tabular-nums">{stats.today}</p>
              <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">Today</p>
            </div>
          </div>
        )}

        {/* New items badge */}
        <AnimatePresence>
          {pendingNew > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setPending(0); reload(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold"
              style={{ background: '#10b98118', color: '#10b981', outline: '1px solid #10b98140' }}
            >
              <Zap className="w-3 h-3" />
              {pendingNew} new
            </motion.button>
          )}
        </AnimatePresence>

        {/* Attribution */}
        <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
          className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors shrink-0 hidden xl:block">
          chiranjib.xyz
        </a>
      </header>

      {/* ── SOURCE TABS ROW ──────────────────────────────────────────────── */}
      <div
        className="flex items-center px-5 gap-4 shrink-0"
        style={{ height: 40, background: '#0d0d0f', borderBottom: '1px solid #1c1c1f' }}
      >
        <SourceTabs active={source} onChange={setSource} />
        <div className="ml-auto shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={reload}
            className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* FEED */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: '1px solid #1c1c1f' }}>
          {/* Panel header */}
          <div className="flex items-center gap-2 px-5 shrink-0" style={{ height: 36, borderBottom: '1px solid #1c1c1f' }}>
            <div className="live-dot" />
            <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Feed</span>
            <span className="font-mono text-[10px] font-bold text-emerald-500 ml-1">{items.length}</span>
            <span className="mx-2 text-zinc-800">|</span>
            <span className="font-mono text-[10px] text-zinc-600">
              {category === 'all' ? 'All Categories' : category.toUpperCase()} · {source === 'all' ? 'All Sources' : source}
            </span>
          </div>

          {/* Cards grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && items.length === 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState search={searchQ} />
            ) : (
              <>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item, i) => <FeedCard key={item.id} item={item} index={i} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-5">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={loadMore}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 text-xs font-medium transition-all"
                    >
                      Load more <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden lg:flex flex-col" style={{ width: 256, borderRight: '1px solid #1c1c1f', flexShrink: 0 }}>
          <div className="flex flex-col overflow-hidden" style={{ height: '52%', borderBottom: '1px solid #1c1c1f' }}>
            <TrendingPanel words={trending} />
          </div>
          <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
            <SignalBrief items={items} stats={stats} brief={brief} briefLoading={briefLoading} />
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ───────────────────────────────────────────────────── */}
      <footer
        className="flex items-center px-5 gap-4 shrink-0"
        style={{ height: 24, background: '#111113', borderTop: '1px solid #1c1c1f' }}
      >
        <span className="font-mono text-[10px] text-zinc-700">TrendsMaster · chiranjib.xyz</span>
        <span className="font-mono text-[10px] text-zinc-800">|</span>
        <span className="font-mono text-[10px] text-emerald-600/60 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          System Nominal
        </span>
        <span className="font-mono text-[10px] text-zinc-800">|</span>
        <span className="font-mono text-[10px] text-zinc-700">
          {stats?.total?.toLocaleString() || 0} signals · {Object.keys(stats?.per_source||{}).length} sources
        </span>
        <div className="ml-auto">
          <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] text-zinc-700 hover:text-emerald-500 transition-colors">
            chiranjib.xyz →
          </a>
        </div>
      </footer>

      {/* ── TOASTS ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-8 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.slice(-3).map(t => (
            <Toast key={t.id} msg={t.msg} onDone={() => setToasts(a => a.filter(x => x.id !== t.id))} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
