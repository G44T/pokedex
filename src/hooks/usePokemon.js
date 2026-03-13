import { useState, useEffect, useCallback, useRef } from 'react'
import { GENERATIONS } from '../utils/constants'

// ─── Cache ────────────────────────────────────────────────────────────────────
const CACHE_KEY = 'pkdx_list_v4'
const CACHE_TTL  = 60 * 60 * 1000  // 1h

// Memory: survives navigation within the session
const mem = {
  byGen: {},   // genId → pokemon[] with types filled
  detail: {},  // id → full pokemon object
  species: {}, // id → species object
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null }
    return data  // { byGen: {...} }
  } catch { return null }
}

function writeSession(byGen) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: { byGen }, ts: Date.now() })) } catch {}
}

async function fetchJSON(url, signal) {
  const res = await fetch(url, signal ? { signal } : undefined)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ─── Fetch pokemon with types for a range of IDs ─────────────────────────────
// Uses 1 request per pokemon but limited to the range (e.g. 151 for Gen I)
// Much faster than loading all 1025 at once.
async function fetchGenPokemon(from, to, onProgress, signal) {
  const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const result = new Array(ids.length)
  let done = 0

  // Fetch in parallel batches of 30
  const BATCH = 30
  for (let i = 0; i < ids.length; i += BATCH) {
    if (signal?.aborted) return null
    const batch = ids.slice(i, i + BATCH)
    await Promise.all(batch.map(async (id, bi) => {
      try {
        const d = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`, signal)
        result[i + bi] = {
          id,
          name: d.name,
          types: d.types.map(t => t.type.name),
        }
      } catch {
        result[i + bi] = { id, name: `pokemon-${id}`, types: ['normal'] }
      }
      done++
      onProgress?.(Math.round((done / ids.length) * 100))
    }))
  }
  return result
}

// ─── usePokemonList ───────────────────────────────────────────────────────────
export function usePokemonList() {
  const [list, setList]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [gen, setGen]         = useState(1)          // ← default Gen I
  const [search, setSearch]   = useState('')
  const abortRef = useRef(null)

  // Restore session cache on mount
  useEffect(() => {
    const session = readSession()
    if (session?.byGen) {
      Object.assign(mem.byGen, session.byGen)
    }
  }, [])

  // Load whenever gen changes
  useEffect(() => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    async function load() {
      setLoading(true)
      setProgress(0)

      // ── 1. Memory hit ───────────────────────────────────
      if (mem.byGen[gen]) {
        setList(mem.byGen[gen])
        setLoading(false)
        setProgress(100)
        return
      }

      // ── 2. Fetch this generation ─────────────────────────
      try {
        let from, to

        if (gen === 'all') {
          // For TODOS: show names immediately, fill types lazily via type buckets
          setProgress(5)
          const res = await fetchJSON(
            'https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0',
            ctrl.signal
          )
          const base = res.results.map((p, i) => ({ id: i + 1, name: p.name, types: [] }))
          setList([...base])
          setLoading(false)
          setProgress(10)

          // Load types via 18 type-buckets
          const typeMap = await buildTypeMap(pct => {
            if (!ctrl.signal.aborted) setProgress(10 + Math.round(pct * 0.88))
          })
          if (ctrl.signal.aborted) return

          base.forEach(p => { p.types = typeMap[p.id] || ['normal'] })
          setProgress(100)
          setList([...base])
          mem.byGen[gen] = base
          writeSession(mem.byGen)
          return
        }

        // Specific generation: fetch only its pokemon
        const gData = GENERATIONS.find(g => g.id === gen)
        if (!gData || !gData.from) return
        from = gData.from
        to   = gData.to

        const pokemon = await fetchGenPokemon(from, to, pct => {
          if (!ctrl.signal.aborted) setProgress(pct)
        }, ctrl.signal)

        if (!pokemon || ctrl.signal.aborted) return

        setProgress(100)
        setList(pokemon)
        setLoading(false)
        mem.byGen[gen] = pokemon
        writeSession(mem.byGen)

      } catch (e) {
        if (e.name !== 'AbortError') {
          setLoading(false)
          setProgress(100)
        }
      }
    }

    load()
    return () => ctrl.abort()
  }, [gen])

  // ── Filter ───────────────────────────────────────────────
  useEffect(() => {
    let f = list
    if (search) {
      const q = search.toLowerCase()
      f = f.filter(p => p.name.includes(q) || String(p.id).includes(q))
    }
    setFiltered(f)
  }, [list, search])

  return { list, filtered, loading, progress, gen, setGen, search, setSearch }
}

// ─── Type bucket loader (used only for TODOS) ─────────────────────────────────
async function buildTypeMap(onProgress) {
  const TYPES = [
    { id: 1, name: 'normal' }, { id: 2, name: 'fighting' }, { id: 3, name: 'flying' },
    { id: 4, name: 'poison' }, { id: 5, name: 'ground'   }, { id: 6, name: 'rock'   },
    { id: 7, name: 'bug'    }, { id: 8, name: 'ghost'    }, { id: 9, name: 'steel'  },
    { id: 10,name: 'fire'   }, { id: 11,name: 'water'    }, { id: 12,name: 'grass'  },
    { id: 13,name: 'electric'},{ id: 14,name: 'psychic'  }, { id: 15,name: 'ice'    },
    { id: 16,name: 'dragon' }, { id: 17,name: 'dark'     }, { id: 18,name: 'fairy'  },
  ]
  const map = {}
  let done = 0
  await Promise.all(TYPES.map(async ({ id, name }) => {
    try {
      const data = await fetchJSON(`https://pokeapi.co/api/v2/type/${id}`)
      data.pokemon.forEach(({ pokemon }) => {
        const m = pokemon.url.match(/\/pokemon\/(\d+)\/$/)
        if (!m) return
        const pid = parseInt(m[1])
        if (pid < 1 || pid > 1025) return
        if (!map[pid]) map[pid] = []
        map[pid].push(name)
      })
    } catch {}
    done++
    onProgress?.(Math.round((done / TYPES.length) * 100))
  }))
  return map
}

// ─── usePokemonDetail ─────────────────────────────────────────────────────────
export function usePokemonDetail() {
  const [pokemon, setPokemon]       = useState(null)
  const [species, setSpecies]       = useState(null)
  const [evoChain, setEvoChain]     = useState(null)
  const [evoIds, setEvoIds]         = useState({})
  const [locationData, setLocationData] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab]               = useState('info')
  const currentIdRef = useRef(null)

  const loadPokemon = useCallback(async (id) => {
    if (currentIdRef.current === id) return
    currentIdRef.current = id
    setSelectedId(id)
    setTab('info')
    setLocationData(null)
    setEvoChain(null)
    setEvoIds({})
    if (!mem.detail[id]) setLoading(true)

    try {
      const [pk, sp] = await Promise.all([
        mem.detail[id]  ? Promise.resolve(mem.detail[id])  : fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`),
        mem.species[id] ? Promise.resolve(mem.species[id]) : fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ])

      if (currentIdRef.current !== id) return
      mem.detail[id]  = pk
      mem.species[id] = sp
      setPokemon(pk)
      setSpecies(sp)
      setLoading(false)

      // Locations async
      if (pk.location_area_encounters) {
        fetchJSON(pk.location_area_encounters)
          .then(d => { if (currentIdRef.current === id) setLocationData(d) })
          .catch(() => { if (currentIdRef.current === id) setLocationData([]) })
      } else {
        setLocationData([])
      }

      // Evo chain async
      if (sp.evolution_chain?.url) {
        fetchJSON(sp.evolution_chain.url)
          .then(async ev => {
            if (currentIdRef.current !== id) return
            setEvoChain(ev.chain)
            const names = []
            const collect = n => { names.push(n.species.name); n.evolves_to.forEach(collect) }
            collect(ev.chain)
            const ids = {}
            await Promise.all(names.map(async n => {
              try { const d = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${n}`); ids[n] = d.id } catch {}
            }))
            if (currentIdRef.current === id) setEvoIds(ids)
          })
          .catch(() => {})
      }
    } catch {
      if (currentIdRef.current === id) setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    currentIdRef.current = null
    setSelectedId(null)
    setPokemon(null)
    setSpecies(null)
    setEvoChain(null)
    setEvoIds({})
    setLocationData(null)
    setTab('info')
  }, [])

  return { pokemon, species, evoChain, evoIds, locationData, loading, selectedId, tab, setTab, loadPokemon, clear }
}
