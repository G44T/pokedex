import styles from './Splash.module.css'

export default function Splash({ message = 'CARGANDO 1025 POKÉMON...' }) {
  return (
    <div className={styles.splash}>
      <div className={styles.ball} />
      <h1>POKÉ<span>DEX</span></h1>
      <p>{message.toUpperCase()}</p>
    </div>
  )
}
