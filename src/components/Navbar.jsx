import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <img src="/logo2.png" alt="Logo" className={styles.logoImg} />
        <span className={styles.logoText}>Cuchillería Artesanal</span>
      </Link>

      <div className={styles.links}>
        <button className={styles.navBtn} onClick={() => scrollTo('inicio')}>Inicio</button>
        <button className={styles.navBtn} onClick={() => scrollTo('productos')}>Productos</button>
        <button className={styles.navBtn} onClick={() => scrollTo('quienes-somos')}>Quiénes somos</button>
        <button className={styles.navBtn} onClick={() => scrollTo('contacto')}>Contacto</button>
      </div>
    </nav>
  )
}