import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Diseño y desarrollo: <span className={styles.name}>Lucía Mariana Morua Medina</span>
      </p>
    </footer>
  )
}