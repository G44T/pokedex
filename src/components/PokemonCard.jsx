import { getTypeColor } from '../utils/constants'
import styles from './PokemonCard.module.css'

export default function PokemonCard({ pokemon, caught, selected, onClick }) {
  const { id, name, types } = pokemon
  return (
    <div
      className={`${styles.card} ${caught ? styles.caught : ''} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      data-id={id}
    >
      <div className={styles.top}>
        <span className={styles.num}>#{String(id).padStart(4, '0')}</span>
        <span className={styles.dot} />
      </div>
      <img
        className={styles.img}
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
        alt={name}
        loading="lazy"
      />
      <div className={styles.name}>{name}</div>
      <div className={styles.typeDots}>
        {(types || []).map(t => (
          <div
            key={t}
            className={styles.dot2}
            style={{ background: getTypeColor(t) }}
            title={t}
          />
        ))}
      </div>
    </div>
  )
}
