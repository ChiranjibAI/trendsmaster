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

export function useAiBrief() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBrief = useCallback(async () => {
    try {
      const d = await (await fetch(`${API_BASE}/api/ai-brief`)).json();
      setBrief(d);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBrief();
    // Poll every 5 min — if stale, backend auto-regenerates
    const t = setInterval(fetchBrief, 300000);
    return () => clearInterval(t);
  }, []);

  return { brief, loading, refresh: fetchBrief };
}

export function useSwarmPredict() {
  const [data, setData] = useState({ predictions: [], generating: false });
  const [loading, setLoading] = useState(true);

  const fetchPredict = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/swarm-predict`);
      const d = await res.json();
      setData(d);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPredict();
    // If still generating, poll every 30s until predictions arrive
    const t = setInterval(() => {
      if (!data.generating) return;
      fetchPredict();
    }, 30000);
    return () => clearInterval(t);
  }, [data.generating]);

  return { data, loading, refresh: () => fetch(`${API_BASE}/api/swarm-predict?refresh=true`).then(fetchPredict) };
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
