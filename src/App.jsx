import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { usePokemonList, usePokemonDetail } from './hooks/usePokemon'
import { GENERATIONS } from './utils/constants'
import AuthScreen from './components/AuthScreen'
import Splash from './components/Splash'
import PokemonCard from './components/PokemonCard'
import DetailPanel from './components/DetailPanel'
import styles from './App.module.css'

export default function App() {
  const { user, caught, saveCaught, syncState, logout } = useAuth()
  const [authTimedOut, setAuthTimedOut] = useState(false)
  const [showSplash, setShowSplash]     = useState(false)
  const [detailOpen, setDetailOpen]     = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)  // always starts closed

  const {
    list, filtered, loading: listLoading, progress,
    gen, setGen, search, setSearch,
  } = usePokemonList()

  const {
    pokemon, species, evoChain, evoIds, locationData,
    loading: detailLoading, selectedId, tab, setTab,
    loadPokemon, clear,
  } = usePokemonDetail()

  // Firebase timeout
  useEffect(() => {
    if (user !== undefined) return
    const t = setTimeout(() => setAuthTimedOut(true), 6000)
    return () => clearTimeout(t)
  }, [user])

  // Show splash on fresh login while list loads
  useEffect(() => {
    if (user && listLoading) setShowSplash(true)
  }, [user])

  // Hide splash when list is ready
  useEffect(() => {
    if (!listLoading && showSplash) {
      const t = setTimeout(() => setShowSplash(false), 600)
      return () => clearTimeout(t)
    }
  }, [listLoading, showSplash])

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    if (!sidebarOpen) return
    const handler = (e) => {
      if (!e.target.closest('[data-sidebar]') && !e.target.closest('[data-sidebar-toggle]')) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sidebarOpen])

  function handleSelectPokemon(id) { loadPokemon(id); setDetailOpen(true) }
  function handleClose()           { setDetailOpen(false); clear() }
  function handleToggleCatch() {
    if (!pokemon) return
    saveCaught({ ...caught, [pokemon.id]: !caught[pokemon.id] })
  }

  const caughtCount = Object.values(caught).filter(Boolean).length
  const hasDetail   = !!selectedId

  // ── Auth guards ────────────────────────────────────────
  if (user === undefined && !authTimedOut) return <Splash message="Iniciando..." />
  if (user === null || authTimedOut)       return <AuthScreen />
  if (showSplash && listLoading)           return <Splash message="Cargando Pokémon..." />

  return (
    <div className={`${styles.shell} ${hasDetail ? styles.hasDetail : ''}`}>

      {/* ── Sidebar overlay (mobile backdrop) ── */}
      {sidebarOpen && (
        <div className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar toggle button — always visible & eye-catching ── */}
      <button
        className={`${styles.sidebarToggle} ${sidebarOpen ? styles.toggleOpen : ''}`}
        onClick={() => setSidebarOpen(v => !v)}
        data-sidebar-toggle
        title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {sidebarOpen ? '✕' : '☰'}
        {!sidebarOpen && caughtCount > 0 && (
          <span className={styles.toggleBadge}>{caughtCount}</span>
        )}
      </button>

      {/* ── Sidebar ── */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ''}`}
        data-sidebar
      >
        {/* Header */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logo}>POKé<span>DEX</span></div>
          <div className={styles.logoSub}>GEN I–IX · 1025 POKÉMON</div>
          <div className={styles.caughtBadge}>
            <div>
              <div className={styles.caughtNum}>{caughtCount}</div>
              <div className={styles.caughtLbl}>CAPTURADOS</div>
            </div>
            <div className={styles.badgeDivider} />
            <div>
              <div className={styles.caughtNum}>{list.length || '—'}</div>
              <div className={styles.caughtLbl}>CARGADOS</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className={styles.userBar}>
          <div className={styles.userAvatar}>
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.displayName || 'Entrenador'}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <span className={`${styles.syncBadge} ${syncState === 'syncing' ? styles.syncing : ''}`}>
            {syncState === 'syncing' ? 'SYNC...' : 'SYNC ✓'}
          </span>
          <button className={styles.logoutBtn} onClick={logout}>SALIR</button>
        </div>

        {/* Search */}
        <div className={styles.sidebarSearch}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Buscar Pokémon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Generations */}
        <div className={styles.sidebarGens}>
          <div className={styles.gensLabel}>GENERACIÓN</div>
          <div className={styles.genPills}>
            {GENERATIONS.map(g => (
              <button
                key={g.id}
                className={`${styles.genPill} ${gen === g.id ? styles.genActive : ''}`}
                onClick={() => { setGen(g.id); setSidebarOpen(false) }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <div className={styles.mainPanel}>

        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mhRow}>
            {/* Spacer for the toggle button */}
            <div style={{ width: 48 }} />
            <div className={styles.logo} style={{ fontSize: 18 }}>POKé<span>DEX</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`${styles.syncBadge} ${syncState === 'syncing' ? styles.syncing : ''}`}>
                {syncState === 'syncing' ? 'SYNC...' : '✓'}
              </span>
              <div className={styles.mhCaught}>
                <div className={styles.mhNum}>{caughtCount}</div>
                <div className={styles.mhLbl}>CAP.</div>
              </div>
            </div>
          </div>
          <div className={styles.mhSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Buscar Pokémon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Gen pills strip on mobile */}
          <div className={styles.mhGens}>
            {GENERATIONS.map(g => (
              <button
                key={g.id}
                className={`${styles.genPill} ${gen === g.id ? styles.genActive : ''}`}
                onClick={() => setGen(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pokemon grid */}
        <div className={styles.listCol}>
          {progress > 0 && progress < 100 && !listLoading && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
          )}
          {listLoading ? (
            <div className={styles.gridLoading}>
              <LoadingBall />
              <p>CARGANDO GEN {typeof gen === 'number' ? gen : ''}...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.noResults}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p>Sin resultados</p>
            </div>
          ) : (
            <div className={styles.pokeGrid}>
              {filtered.map(p => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  caught={!!caught[p.id]}
                  selected={selectedId === p.id}
                  onClick={() => handleSelectPokemon(p.id)}
                />
              ))}
            </div>
          )}
          {!listLoading && (
            <div className={styles.listFooter}>{filtered.length} de {list.length} Pokémon</div>
          )}
        </div>

        {/* Detail column (desktop) */}
        <div className={styles.detailCol}>
          {!hasDetail ? (
            <div className={styles.detailPlaceholder}>
              <div style={{ fontSize: 72, opacity: .15 }}>⚪</div>
              <p>SELECCIONA UN POKÉMON</p>
            </div>
          ) : detailLoading && !pokemon ? (
            <div className={styles.detailPlaceholder}><LoadingBall /></div>
          ) : pokemon ? (
            <DetailPanel
              pokemon={pokemon} species={species}
              evoChain={evoChain} evoIds={evoIds} locationData={locationData}
              caught={!!caught[pokemon.id]}
              onToggleCatch={handleToggleCatch}
              onSelectPokemon={handleSelectPokemon}
              tab={tab} onTabChange={setTab} onClose={handleClose}
            />
          ) : null}
        </div>
      </div>

      {/* Mobile detail sheet */}
      {detailOpen && (
        <>
          <div className={styles.overlay} onClick={handleClose} />
          <div className={`${styles.mobileSheet} ${detailOpen ? styles.sheetOpen : ''}`}>
            <div className={styles.dragHandle} />
            {detailLoading && !pokemon ? (
              <div style={{ padding: 60, textAlign: 'center' }}><LoadingBall /></div>
            ) : pokemon ? (
              <DetailPanel
                pokemon={pokemon} species={species}
                evoChain={evoChain} evoIds={evoIds} locationData={locationData}
                caught={!!caught[pokemon.id]}
                onToggleCatch={handleToggleCatch}
                onSelectPokemon={handleSelectPokemon}
                tab={tab} onTabChange={setTab} onClose={handleClose}
              />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

function LoadingBall() {
  return (
    <div style={{
      width: 52, height: 52,
      borderRadius: '50%',
      background: 'linear-gradient(180deg, var(--red) 50%, #1a1a2a 50%)',
      border: '3px solid #333',
      animation: 'sBounce .9s ease-in-out infinite',
    }} />
  )
}
