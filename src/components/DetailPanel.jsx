import { useState } from 'react'
import { getTypeColor, TYPE_EMOJI, STAT_LABELS, getGameMeta, GAME_META, GAME_RELEASE_ORDER } from '../utils/constants'
import styles from './DetailPanel.module.css'

const TABS = [
  { id: 'info',  label: '📊 Stats' },
  { id: 'moves', label: '⚔️ Movs' },
  { id: 'where', label: '📍 Lugar' },
  { id: 'evo',   label: '🧬 Evo' },
]

export default function DetailPanel({ pokemon, species, evoChain, evoIds, locationData, caught, onToggleCatch, onSelectPokemon, tab, onTabChange, onClose }) {
  const [openGames, setOpenGames] = useState({})

  if (!pokemon) return null

  const mainType = pokemon.types[0].type.name
  const col = getTypeColor(mainType)
  const flavor = (
    species?.flavor_text_entries?.find(f => f.language.name === 'es') ||
    species?.flavor_text_entries?.find(f => f.language.name === 'en')
  )?.flavor_text?.replace(/\f|\n/g, ' ') || ''
  const genera = (
    species?.genera?.find(g => g.language.name === 'es') ||
    species?.genera?.find(g => g.language.name === 'en')
  )?.genus || ''

  function toggleGame(key) {
    setOpenGames(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className={styles.wrap} style={{ '--col': col }}>
      {/* Close button (mobile) */}
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      {/* Hero */}
      <div className={styles.hero} style={{ background: `linear-gradient(150deg, ${col}1c 0%, #0A0A0F 60%)` }}>
        <div className={styles.heroGlow} style={{ background: col }} />
        <div className={styles.watermark}>{String(pokemon.id).padStart(4, '0')}</div>

        <button
          className={styles.catchBtn}
          style={{ background: caught ? col : '#13131A', borderColor: col }}
          onClick={onToggleCatch}
        >
          {caught ? '✅' : '⬜'}
        </button>

        <div className={styles.heroMeta} style={{ color: col }}>
          #{String(pokemon.id).padStart(4, '0')}{genera ? ` · ${genera}` : ''}
        </div>
        <div className={styles.heroName}>{pokemon.name}</div>

        <div className={styles.heroTypes}>
          {pokemon.types.map(t => (
            <span
              key={t.type.name}
              className={styles.typeBadge}
              style={{ background: getTypeColor(t.type.name), boxShadow: `0 2px 10px ${getTypeColor(t.type.name)}44` }}
            >
              {TYPE_EMOJI[t.type.name] || ''} {t.type.name}
            </span>
          ))}
        </div>

        <div className={styles.heroImgArea}>
          <img
            className={styles.heroImg}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            alt={pokemon.name}
            style={{ filter: `drop-shadow(0 8px 28px ${col}66)` }}
          />
        </div>

        <div className={styles.measures}>
          <div className={styles.measure}>
            <div className={styles.measureVal}>{(pokemon.height / 10).toFixed(1)}m</div>
            <div className={styles.measureLbl}>ALTURA</div>
          </div>
          <div className={styles.measureDiv} />
          <div className={styles.measure}>
            <div className={styles.measureVal}>{(pokemon.weight / 10).toFixed(1)}kg</div>
            <div className={styles.measureLbl}>PESO</div>
          </div>
          <div className={styles.measureDiv} />
          <div className={styles.measure}>
            <div className={styles.measureVal}>{pokemon.base_experience || '?'}</div>
            <div className={styles.measureLbl}>EXP</div>
          </div>
        </div>

        {flavor && <div className={styles.flavor}>"{flavor}"</div>}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={styles.tabBtn}
            style={{
              color: tab === t.id ? col : '#556',
              borderBottomColor: tab === t.id ? col : 'transparent',
            }}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.content} key={tab}>
        {tab === 'info' && <StatsTab pokemon={pokemon} col={col} />}
        {tab === 'moves' && <MovesTab pokemon={pokemon} col={col} />}
        {tab === 'where' && <WhereTab locationData={locationData} col={col} openGames={openGames} toggleGame={toggleGame} />}
        {tab === 'evo' && <EvoTab species={species} evoChain={evoChain} evoIds={evoIds} col={col} onSelectPokemon={onSelectPokemon} />}
      </div>
    </div>
  )
}

// ── Stats Tab ──────────────────────────────────────────────────
function StatsTab({ pokemon, col }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.secTitle} style={{ color: col }}>ESTADÍSTICAS BASE</div>
      {pokemon.stats.map(s => {
        const max = s.stat.name === 'hp' ? 255 : s.stat.name === 'speed' ? 200 : 250
        const pct = Math.min(100, s.base_stat / max * 100)
        const barColor = pct > 66 ? '#5BAD5B' : pct > 33 ? '#F7C948' : '#E8608A'
        return (
          <div key={s.stat.name} className={styles.statRow}>
            <span className={styles.statLbl}>{STAT_LABELS[s.stat.name] || s.stat.name}</span>
            <span className={styles.statNum}>{s.base_stat}</span>
            <div className={styles.statTrack}>
              <div className={styles.statFill} style={{ width: `${pct}%`, background: barColor }} />
            </div>
          </div>
        )
      })}
      <div className={styles.abilitiesBox}>
        <div className={styles.abilitiesLabel}>HABILIDADES</div>
        {pokemon.abilities.map(a => (
          <span
            key={a.ability.name}
            className={styles.abilityChip}
            style={{ background: `${col}15`, color: col, borderColor: `${col}40` }}
          >
            {a.is_hidden ? '🔒 ' : ''}{a.ability.name.replace(/-/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Moves Tab ──────────────────────────────────────────────────
function MovesTab({ pokemon, col }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.secTitle} style={{ color: col }}>
        MOVIMIENTOS ({Math.min(pokemon.moves.length, 60)} de {pokemon.moves.length})
      </div>
      <div className={styles.movesList}>
        {pokemon.moves.slice(0, 60).map(m => {
          const lv = m.version_group_details?.find(v => v.move_learn_method?.name === 'level-up')?.level_learned_at
          const me = m.version_group_details?.[0]?.move_learn_method?.name
          const tag = me === 'level-up' ? `Nv.${lv || '?'}` :
                      me === 'machine' ? 'MT' :
                      me === 'egg' ? 'Huevo' :
                      me === 'tutor' ? 'Tutor' : me || ''
          return (
            <div key={m.move.name} className={styles.moveRow}>
              <span className={styles.moveName}>{m.move.name.replace(/-/g, ' ')}</span>
              <span className={styles.moveTag} style={{ color: col }}>{tag}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Where Tab ──────────────────────────────────────────────────
function WhereTab({ locationData, col, openGames, toggleGame }) {
  if (locationData === null) return <Loading />
  if (!locationData.length) return (
    <div className={styles.tabContent}>
      <div className={styles.locEmpty}>
        <div style={{ fontSize: 38, marginBottom: 10 }}>🎁</div>
        <p>No aparece en la naturaleza.<br />Obtención: evolución, evento o intercambio.</p>
      </div>
    </div>
  )

  // Group by game
  const byGame = {}
  locationData.forEach(loc => {
    const area = (loc.location_area?.name || 'área').replace(/-/g, ' ')
    ;(loc.version_details || []).forEach(vd => {
      const ver = vd.version?.name || '?'
      if (!byGame[ver]) byGame[ver] = []
      const chance = vd.encounter_details?.[0]?.chance ?? '?'
      const method = vd.encounter_details?.[0]?.method?.name || ''
      if (!byGame[ver].find(a => a.area === area)) byGame[ver].push({ area, chance, method })
    })
  })

  // Filter to EUR games only, then sort by release date
  const games = Object.keys(byGame)
    .filter(g => GAME_META[g])  // only known EUR games
    .sort((a, b) => {
      const ai = GAME_RELEASE_ORDER.indexOf(a)
      const bi = GAME_RELEASE_ORDER.indexOf(b)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  if (!games.length) return <div className={styles.tabContent}><p style={{ color: 'var(--sub)' }}>Sin datos de ubicación.</p></div>

  return (
    <div className={styles.tabContent}>
      <div className={styles.secTitle} style={{ color: col }}>DÓNDE ENCONTRARLO</div>
      {games.map((game, idx) => {
        const m = getGameMeta(game)
        const areas = byGame[game]
        const isOpen = openGames[idx]
        return (
          <div key={game} className={styles.gameBlock}>
            <div className={styles.gameHeader} onClick={() => toggleGame(idx)}>
              <div className={styles.gameIcon} style={{ background: `${m.c}22`, border: `1.5px solid ${m.c}44` }}>{m.e}</div>
              <div className={styles.gameTitle}>{m.l}</div>
              <div className={styles.gameCount}>{areas.length} zona{areas.length !== 1 ? 's' : ''}</div>
              <div className={`${styles.gameChev} ${isOpen ? styles.chevOpen : ''}`}>▼</div>
            </div>
            {isOpen && (
              <div className={styles.gameAreas}>
                {areas.map((a, i) => (
                  <div key={i} className={styles.areaRow}>
                    <div>
                      <div className={styles.areaName}>📍 {a.area}</div>
                      {a.method && <div className={styles.areaMethod}>{a.method.replace(/-/g, ' ')}</div>}
                    </div>
                    <div className={styles.areaChance} style={{ color: col }}>{a.chance}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Evo Tab ────────────────────────────────────────────────────
function EvoTab({ species, evoChain, evoIds, col, onSelectPokemon }) {
  if (!evoChain) return <Loading />

  const evos = []
  const collect = (node, trigger) => {
    evos.push({ name: node.species.name, trigger })
    node.evolves_to.forEach(n => {
      const d = n.evolution_details[0]
      const t = d?.min_level ? `Nv.${d.min_level}` :
                d?.item ? d.item.name.replace(/-/g, ' ') :
                d?.trigger?.name === 'trade' ? 'Intercambio' :
                d?.min_happiness ? 'Felicidad' : 'Especial'
      collect(n, t)
    })
  }
  collect(evoChain, null)

  const gen = species?.generation?.name?.replace('generation-', 'Gen ').toUpperCase() || '?'

  return (
    <div className={styles.tabContent}>
      <div className={styles.secTitle} style={{ color: col }}>LÍNEA EVOLUTIVA</div>
      <div className={styles.evoRail}>
        {evos.map((e, i) => {
          const eid = evoIds[e.name]
          return (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && (
                <div className={styles.evoArrow}>
                  <div className={styles.evoTrigger}>{e.trigger}</div>
                  <span style={{ fontSize: 15, color: '#444' }}>→</span>
                </div>
              )}
              <div className={styles.evoNode} onClick={() => eid && onSelectPokemon(eid)}>
                {eid ? (
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${eid}.png`}
                    alt={e.name}
                    style={{ width: 60, height: 60, objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 24 }}>⬤</div>
                )}
                <span>{e.name}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.breedBox}>
        <div className={styles.breedLabel}>DATOS DE CRIANZA</div>
        <div className={styles.breedStats}>
          <div className={styles.breedStat}><div className={styles.bv}>{species?.base_happiness ?? '?'}</div><div className={styles.bl}>Felicidad base</div></div>
          <div className={styles.breedStat}><div className={styles.bv}>{species?.capture_rate ?? '?'}</div><div className={styles.bl}>Tasa captura</div></div>
          <div className={styles.breedStat}><div className={styles.bv}>{gen}</div><div className={styles.bl}>Generación</div></div>
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <div style={{
        width: 52, height: 52, position: 'relative',
        animation: 'sBounce .9s ease-in-out infinite',
        borderRadius: '50%',
        background: 'linear-gradient(180deg, var(--red) 50%, #1a1a2a 50%)',
        border: '3px solid #333'
      }} />
      <p style={{ marginTop: 14, color: 'var(--sub)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>CARGANDO...</p>
    </div>
  )
}
