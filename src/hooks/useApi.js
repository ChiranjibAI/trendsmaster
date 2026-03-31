import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE, WS_BASE } from '../config';

export function useFeed(category, source, search) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    const off = reset ? 0 : offset;
    try {
      const url = search
        ? `${API_BASE}/api/search?q=${encodeURIComponent(search)}&limit=40`
        : `${API_BASE}/api/feed?category=${category}&source=${source}&limit=40&offset=${off}`;
      const res = await fetch(url);
      const data = await res.json();
      const newItems = data.items || [];
      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      setOffset(reset ? newItems.length : off + newItems.length);
      setHasMore(newItems.length >= 40);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [category, source, search, offset]);

  useEffect(() => { load(true); }, [category, source, search]);

  return { items, loading, hasMore, loadMore: () => load(false), reload: () => load(true) };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  const fetch_ = useCallback(async () => {
    try {
      const d = await (await fetch(`${API_BASE}/api/stats`)).json();
      setStats(d);
    } catch (e) {}
  }, []);
  useEffect(() => { fetch_(); const t = setInterval(fetch_, 30000); return () => clearInterval(t); }, []);
  return stats;
}

export function useTrending() {
  const [words, setWords] = useState([]);
  useEffect(() => {
    const f = async () => {
      try {
        const d = await (await fetch(`${API_BASE}/api/trending`)).json();
        setWords((d.trending || []).slice(0, 25));
      } catch (e) {}
    };
    f(); const t = setInterval(f, 120000); return () => clearInterval(t);
  }, []);
  return words;
}

export function useSources() {
  const [sources, setSources] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/sources`).then(r => r.json()).then(d => setSources(d.sources || [])).catch(() => {});
  }, []);
  return sources;
}

export function useWebSocket(onMessage) {
  const wsRef = useRef(null);
  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_BASE}/ws`);
    ws.onmessage = e => { try { onMessage(JSON.parse(e.data)); } catch (_) {} };
    ws.onclose = () => setTimeout(connect, 3000);
    wsRef.current = ws;
    return ws;
  }, [onMessage]);
  useEffect(() => { const ws = connect(); return () => ws.close(); }, []);
}
