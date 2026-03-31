import { useState, useCallback } from 'react';
import { Search, Sun, Moon, Bell, Zap } from 'lucide-react';

export default function Header({ onSearch, newCount, onNewClick, dark, onToggleDark, stats }) {
  const [q, setQ] = useState('');
  const handleSearch = useCallback((v) => {
    setQ(v);
    onSearch(v);
  }, [onSearch]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50" style={{height:'56px'}}>
      <div className="flex items-center h-full px-4 gap-3">

        {/* Logo */}
        <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-black">T</div>
          <span className="font-black text-lg bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent hidden sm:block">
            TrendsMaster
          </span>
        </a>

        {/* LIVE badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/25 shrink-0">
          <div className="live-dot w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-green-400 text-xs font-bold tracking-wider">LIVE</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search all trends..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-900 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition-all placeholder-gray-600"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* New items badge */}
          {newCount > 0 && (
            <button onClick={onNewClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all text-sm font-semibold animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              {newCount} new
            </button>
          )}

          {/* Stats */}
          {stats && (
            <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
              <span className="text-gray-300 font-medium">{stats.total?.toLocaleString()} items</span>
              <span>|</span>
              <span className="text-blue-400 font-medium">{stats.today} today</span>
            </div>
          )}

          {/* By Chiranjib */}
          <a href="https://chiranjib.xyz" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all text-xs font-medium text-gray-300 border border-gray-700/50">
            <span>by</span>
            <span className="text-purple-400 font-semibold">Chiranjib</span>
          </a>

          {/* Dark toggle */}
          <button onClick={onToggleDark}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all border border-gray-700/50">
            {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
