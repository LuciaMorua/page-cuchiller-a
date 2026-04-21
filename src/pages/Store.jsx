import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import styles from './Store.module.css'

const WHATSAPP = '5491112345678' // ← reemplazá con tu número

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!ignore) {
        setProducts(data || [])
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        if (!ignore) setProducts(data || [])
      })
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>

      {/* INICIO */}
      <div id="inicio">
        <HeroCarousel isAdmin={false} />
      </div>

      {/* PRODUCTOS */}
      <div id="productos" className={styles.header}>
        <h1>Descubrí nuestra colección</h1>
        <p>Productos artesanales y seleccionados con cuidado</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛍</div>
          <p>No hay productos todavía</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* QUIÉNES SOMOS */}
      <section id="quienes-somos" className={styles.section}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionTag}>Nuestra historia</p>
          <h2 className={styles.sectionTitle}>Quiénes somos</h2>
          <p className={styles.sectionText}>
            Somos una cuchillería artesanal con años de experiencia en la fabricación de piezas únicas.
            Cada cuchillo es trabajado a mano, con materiales seleccionados y técnicas tradicionales
            que garantizan calidad y durabilidad. Nuestra pasión es crear herramientas que perduren
            y cuenten una historia.
          </p>
          <p className={styles.sectionText}>
            Trabajamos con aceros de alta calidad y maderas nobles, combinando la tradición
            artesanal con el diseño contemporáneo. Cada pieza es única e irrepetible.
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className={styles.contactSection}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionTag}>Hablemos</p>
          <h2 className={styles.sectionTitle}>Contacto</h2>
          <p className={styles.sectionText}>
            ¿Tenés alguna consulta o querés hacer un pedido personalizado?
            Escribinos directamente por WhatsApp.
          </p>
          <a
            href={`https://wa.me/${5493406506364}?text=Hola%2C%20me%20interesa%20un%20cuchillo%20artesanal`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.847L.057 23.882a.5.5 0 0 0 .61.61l6.085-1.497A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.371l-.36-.214-3.733.918.946-3.636-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/>
            </svg>
            Escribinos por WhatsApp
          </a>
        </div>
      </section>

    </div>
  )
}