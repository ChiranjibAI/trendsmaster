import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FeedCard from './components/FeedCard';
import { useFeed, useStats, useTrending, useSources, useWebSocket } from './hooks/useApi';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';

function Toast({ msg, type = 'purple', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="toast-enter flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800 border border-purple-500/30 shadow-xl text-sm font-medium text-gray-100 max-w-sm">
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-300">✕</button>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [pendingNew, setPendingNew] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [searchInput, setSearchInput] = useState('');

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
  const handleWsMessage = useCallback((msg) => {
    if (msg.type === 'new_items') {
      setPendingNew(n => n + msg.count);
      addToast(`🔥 ${msg.count} new trending items!`);
    }
  }, []);
  useWebSocket(handleWsMessage);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.body.className = dark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900';
  }, [dark]);

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
  };

  const handleNewClick = () => {
    setPendingNew(0);
    reload();
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <Header
        onSearch={setSearchInput}
        newCount={pendingNew}
        onNewClick={handleNewClick}
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
        stats={stats}
      />

      <div className="flex" style={{ paddingTop: '56px', minHeight: '100vh' }}>
        <Sidebar
          category={category}
          source={source}
          onCategory={c => { setCategory(c); setSource('all'); }}
          onSource={s => setSource(s)}
          trending={trending}
          sources={sources}
          stats={stats}
        />

        {/* Main */}
        <main className="flex-1 md:ml-52 p-4">

          {/* Stats bar */}
          {stats && (
            <div className="flex items-center gap-4 mb-4 px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800/40 text-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-xs">Total</span>
                <span className="font-bold">{stats.total?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-xs">Today</span>
                <span className="font-bold text-blue-400">{stats.today}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-green-400">● {(stats.live_clients||0)+1} online</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={reload} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 hover:text-gray-200 transition-all border border-gray-700/50">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-purple-500" />
              <p className="font-medium">Loading live trends...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="text-5xl mb-3">🔍</span>
              <p className="font-medium">No results found</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map(item => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && items.length > 0 && (
            <div className="flex justify-center mt-6">
              <button onClick={loadMore}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-purple-600 font-semibold transition-all text-sm border border-gray-700/50 hover:border-purple-500 flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Load More
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} msg={t.msg} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
