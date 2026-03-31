import { ExternalLink, ArrowUp, MessageSquare, Share2 } from 'lucide-react';
import { CAT_COLORS, SOURCE_META } from '../config';

function timeAgo(ts) {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}

export default function FeedCard({ item }) {
  const srcBase = item.source?.split('/')[0] || 'default';
  const srcMeta = SOURCE_META[srcBase] || SOURCE_META.default;
  const catColor = CAT_COLORS[item.category] || CAT_COLORS.tech;

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.url });
    } else {
      navigator.clipboard.writeText(item.url);
    }
  };

  return (
    <div
      onClick={() => window.open(item.url || '#', '_blank', 'noopener')}
      className="group card-hover bg-gray-900 border border-gray-800/60 rounded-xl overflow-hidden cursor-pointer hover:border-purple-500/30 hover:bg-gray-800/80"
    >
      {/* Image */}
      {item.image && (
        <div className="relative h-36 bg-gray-800 overflow-hidden">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        </div>
      )}

      <div className="p-3 space-y-2">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>
            {item.category || 'tech'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-gray-800 text-gray-400 border border-gray-700/50">
            {srcMeta.icon} {srcBase}
          </span>
          <span className="ml-auto text-xs text-gray-600 shrink-0">
            {timeAgo(item.timestamp || 0)} ago
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug line-clamp-3 text-gray-100 group-hover:text-purple-300 transition-colors">
          {item.title || ''}
        </h3>

        {/* Author + stats */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {item.score > 0 && (
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {fmtNum(item.score)}
              </span>
            )}
            {item.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {fmtNum(item.comments)}
              </span>
            )}
            {item.author && (
              <span className="truncate max-w-24 text-gray-600">{item.author}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-600 hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100"
            >
              <Share2 className="w-3 h-3" />
            </button>
            <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
