import { CATEGORIES, SOURCE_META } from '../config';

export default function Sidebar({ category, source, onCategory, onSource, trending, sources, stats }) {
  const getSourceMeta = (s) => {
    const base = s.split('/')[0];
    return SOURCE_META[base] || SOURCE_META.default;
  };

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-52 bg-gray-900/50 border-r border-gray-800/50 overflow-y-auto z-40 hidden md:flex flex-col">
      <div className="p-3 space-y-5">

        {/* Categories */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Categories</p>
          <div className="space-y-0.5">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => onCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  category === cat.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}>
                <span className="text-base w-5 text-center">{cat.icon}</span>
                <span>{cat.label}</span>
                {stats?.per_source && cat.id !== 'all' && (
                  <span className="ml-auto text-xs opacity-50">—</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Sources</p>
          <div className="space-y-0.5">
            <button onClick={() => onSource('all')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                source === 'all' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
              }`}>
              All Sources
            </button>
            {sources.map(s => {
              const meta = getSourceMeta(s);
              const count = stats?.per_source?.[s] || 0;
              return (
                <button key={s} onClick={() => onSource(s)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                    source === s ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                  }`}>
                  <span>{meta.icon}</span>
                  <span className="truncate flex-1">{s.replace('reddit/r/', 'r/')}</span>
                  {count > 0 && <span className="ml-auto opacity-40 shrink-0">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trending words */}
        {trending.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">🔥 Hot Words</p>
            <div className="flex flex-wrap gap-1.5 px-2">
              {trending.slice(0, 20).map(w => (
                <span key={w.word}
                  className="cursor-pointer px-2 py-0.5 rounded-full text-xs bg-gray-800 hover:bg-purple-600/20 hover:text-purple-400 text-gray-400 transition-all border border-gray-700/50">
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-gray-800/50">
          <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
            <span>⚡</span>
            <span>Built by <span className="text-purple-400 font-semibold">Chiranjib</span></span>
          </a>
        </div>
      </div>
    </aside>
  );
}
