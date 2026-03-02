// src/App.tsx
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

type Genre = { id: number; name: string };

type Show = {
  id: number;
  name: string;
  description?: string;
  releaseYear?: number;
  totalEpisodes?: number;
  channel?: string;
  director?: string;
  writer?: string;
  cast?: string;
  status?: string;
  rating?: number;
  genres: Genre[];
  _count?: { episodes: number };
};

// Debounce hook — waits for user to stop typing before firing
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  // Search + filter state
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minRating, setMinRating] = useState('');

  // Debounce the search query — 300ms delay
  const debouncedQuery = useDebounce(query, 300);

  // Fetch genres once on mount
  useEffect(() => {
    fetch(`${API_BASE}/genres`)
      .then(r => r.json())
      .then(setGenres)
      .catch(console.error);
  }, []);

  // Fetch shows whenever debounced query or filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedStatus) params.set('status', selectedStatus);
    if (minRating) params.set('minRating', minRating);

    const hasFilters = params.toString().length > 0;
    const url = hasFilters
      ? `${API_BASE}/shows/search?${params.toString()}`
      : `${API_BASE}/shows`;

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => {
        // /api/shows returns array; /api/shows/search returns { results, count }
        setShows(Array.isArray(data) ? data : data.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery, selectedGenre, selectedStatus, minRating]);

  const clearFilters = () => {
    setQuery('');
    setSelectedGenre('');
    setSelectedStatus('');
    setMinRating('');
  };

  const hasActiveFilters = query || selectedGenre || selectedStatus || minRating;

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.logo}>جہاں</h1>
            <p style={styles.tagline}>jahaan • drama tracker</p>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Search bar */}
        <div style={styles.searchSection}>
          <div style={styles.searchInputWrapper}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search by title, cast, director..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button style={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
            )}
          </div>

          {/* Filters row */}
          <div style={styles.filtersRow}>
            <select
              style={styles.select}
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>

            <select
              style={styles.select}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
            </select>

            <select
              style={styles.select}
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="9">9+ ★</option>
              <option value="8">8+ ★</option>
              <option value="7">7+ ★</option>
            </select>

            {hasActiveFilters && (
              <button style={styles.clearAllBtn} onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div style={styles.resultsBar}>
          {loading ? (
            <span style={styles.loadingText}>Searching...</span>
          ) : (
            <span style={styles.resultsCount}>
              {shows.length} {shows.length === 1 ? 'show' : 'shows'}
              {hasActiveFilters ? ' found' : ' total'}
            </span>
          )}
        </div>

        {/* Show grid */}
        <div style={styles.grid}>
          {shows.map(show => (
            <div
              key={show.id}
              style={styles.card}
              onClick={() => setSelectedShow(show)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
              }}
            >
              <div style={styles.cardTop}>
                <div style={styles.ratingBadge}>
                  ★ {show.rating?.toFixed(1) ?? '—'}
                </div>
                <div style={styles.yearBadge}>{show.releaseYear}</div>
              </div>

              <h2 style={styles.showName}>{show.name}</h2>
              <p style={styles.channel}>{show.channel}</p>

              <p style={styles.description}>
                {show.description
                  ? show.description.length > 100
                    ? show.description.slice(0, 100) + '...'
                    : show.description
                  : 'No description available.'}
              </p>

              <div style={styles.cardFooter}>
                <div style={styles.genrePills}>
                  {show.genres.slice(0, 2).map(g => (
                    <span key={g.id} style={styles.genrePill}>{g.name}</span>
                  ))}
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: show.status === 'Completed' ? '#1a3a2a' : '#3a2a1a',
                  color: show.status === 'Completed' ? '#4ade80' : '#fb923c',
                }}>
                  {show.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && shows.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>◎</p>
            <p style={styles.emptyText}>No shows found</p>
            <p style={styles.emptySubtext}>Try adjusting your search or filters</p>
            <button style={styles.clearAllBtn} onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </main>

      {/* Show detail modal */}
      {selectedShow && (
        <div style={styles.overlay} onClick={() => setSelectedShow(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedShow(null)}>✕</button>

            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedShow.name}</h2>
              <div style={styles.modalMeta}>
                <span>★ {selectedShow.rating?.toFixed(1)}</span>
                <span>·</span>
                <span>{selectedShow.releaseYear}</span>
                <span>·</span>
                <span>{selectedShow.channel}</span>
              </div>
            </div>

            <p style={styles.modalDescription}>{selectedShow.description}</p>

            <div style={styles.modalDetails}>
              {selectedShow.director && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Director</span>
                  <span style={styles.detailValue}>{selectedShow.director}</span>
                </div>
              )}
              {selectedShow.writer && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Writer</span>
                  <span style={styles.detailValue}>{selectedShow.writer}</span>
                </div>
              )}
              {selectedShow.cast && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Cast</span>
                  <span style={styles.detailValue}>{selectedShow.cast}</span>
                </div>
              )}
              {selectedShow.totalEpisodes && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Episodes</span>
                  <span style={styles.detailValue}>{selectedShow.totalEpisodes}</span>
                </div>
              )}
            </div>

            <div style={styles.modalGenres}>
              {selectedShow.genres.map(g => (
                <span key={g.id} style={styles.genrePill}>{g.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#e8e0d5',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  header: {
    borderBottom: '1px solid #1e1e2e',
    padding: '24px 0',
    background: '#0d0d17',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
  },
  logo: {
    fontSize: 36,
    fontWeight: 400,
    margin: 0,
    color: '#d4a574',
    letterSpacing: 2,
  },
  tagline: {
    margin: '4px 0 0',
    fontSize: 12,
    color: '#555',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 20,
    color: '#555',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '14px 44px 14px 48px',
    background: '#13131f',
    border: '1px solid #2a2a3e',
    borderRadius: 8,
    color: '#e8e0d5',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    fontSize: 14,
    padding: 4,
  },
  filtersRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  select: {
    padding: '9px 14px',
    background: '#13131f',
    border: '1px solid #2a2a3e',
    borderRadius: 6,
    color: '#e8e0d5',
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
  },
  clearAllBtn: {
    padding: '9px 16px',
    background: 'none',
    border: '1px solid #3a3a5a',
    borderRadius: 6,
    color: '#888',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  resultsBar: {
    marginBottom: 20,
    minHeight: 24,
  },
  resultsCount: {
    fontSize: 13,
    color: '#555',
    letterSpacing: 1,
  },
  loadingText: {
    fontSize: 13,
    color: '#d4a574',
    letterSpacing: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#13131f',
    border: '1px solid #1e1e2e',
    borderRadius: 10,
    padding: 20,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingBadge: {
    fontSize: 13,
    color: '#d4a574',
    fontWeight: 600,
  },
  yearBadge: {
    fontSize: 12,
    color: '#555',
  },
  showName: {
    margin: '0 0 4px',
    fontSize: 18,
    fontWeight: 600,
    color: '#e8e0d5',
    lineHeight: 1.3,
  },
  channel: {
    margin: '0 0 10px',
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  description: {
    margin: '0 0 16px',
    fontSize: 13,
    color: '#888',
    lineHeight: 1.6,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  genrePills: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  genrePill: {
    padding: '3px 10px',
    background: '#1e1e35',
    border: '1px solid #2a2a4a',
    borderRadius: 20,
    fontSize: 11,
    color: '#9090c0',
    letterSpacing: 0.5,
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    letterSpacing: 0.5,
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: 48,
    color: '#2a2a3e',
    margin: '0 0 16px',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    margin: '0 0 8px',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    margin: '0 0 20px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 24,
  },
  modal: {
    background: '#13131f',
    border: '1px solid #2a2a3e',
    borderRadius: 12,
    padding: 32,
    maxWidth: 600,
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 600,
    color: '#e8e0d5',
  },
  modalMeta: {
    display: 'flex',
    gap: 8,
    fontSize: 14,
    color: '#d4a574',
  },
  modalDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 1.7,
    marginBottom: 24,
  },
  modalDetails: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  detailRow: {
    display: 'flex',
    gap: 16,
    fontSize: 14,
  },
  detailLabel: {
    color: '#555',
    minWidth: 80,
    flexShrink: 0,
  },
  detailValue: {
    color: '#ccc',
  },
  modalGenres: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
};
