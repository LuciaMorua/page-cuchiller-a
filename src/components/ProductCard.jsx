import { useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { id, name, description, category, price, image_url, in_stock } = product
  const navigate = useNavigate()

  return (
    <div
      className={`${styles.card} ${!in_stock ? styles.outOfStock : ''}`}
      onClick={() => navigate(`/producto/${id}`)}
    >
      <div className={styles.imgWrap}>
        {image_url ? (
          <img src={image_url} alt={name} className={styles.img} />
        ) : (
          <div className={styles.placeholder}>Sin imagen</div>
        )}
        <span className={`${styles.badge} ${in_stock ? styles.in : styles.out}`}>
          {in_stock ? '✓ Disponible' : 'Sin stock'}
        </span>
      </div>
      <div className={styles.info}>
        <div className={styles.category}>{category}</div>
        <div className={styles.name}>{name}</div>
        <div className={styles.desc}>{description}</div>
        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            {price.toLocaleString('es-AR')}
          </div>
          <span className={styles.verMas}>Ver más →</span>
        </div>
      </div>
    </div>
  )
}