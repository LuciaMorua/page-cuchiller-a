import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import styles from './HeroCarousel.module.css'

export default function HeroCarousel({ isAdmin = false }) {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [slogan, setSlogan] = useState('Cada hoja, una historia')
  const [sloganInput, setSloganInput] = useState('Cada hoja, una historia')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  async function fetchSlides() {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('orden', { ascending: true })
    setSlides(data || [])
    setLoading(false)
  }

  async function fetchSlogan() {
    const { data } = await supabase
      .from('hero_config')
      .select('valor')
      .eq('clave', 'slogan')
      .single()
    if (data) {
      setSlogan(data.valor)
      setSloganInput(data.valor)
    }
  }

  useEffect(() => {
    fetchSlides()
    fetchSlogan()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fileName = `hero_${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error al subir imagen: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(fileName)

    await supabase.from('hero_slides').insert({
      url: urlData.publicUrl,
      orden: slides.length,
    })

    e.target.value = ''
    fetchSlides()
    setUploading(false)
  }

  async function handleDelete(id, url) {
  if (!confirm('¿Eliminar esta imagen del carrusel?')) return

  try {
    // Obtener path real del archivo
    const path = url.split('/hero-images/')[1]

    // Borrar del storage
    if (path) {
      const { error: storageError } = await supabase.storage
        .from('hero-images')
        .remove([path])

      if (storageError) throw storageError
    }

    // Borrar de la base de datos
    const { error: dbError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    setCurrent(0)
    fetchSlides()

  } catch (error) {
    console.error(error)
    alert('Error al eliminar imagen')
  }
}

  async function saveSlogan() {
    await supabase
      .from('hero_config')
      .upsert({ clave: 'slogan', valor: sloganInput }, { onConflict: 'clave' })
    setSlogan(sloganInput)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const goTo = useCallback((n, total) => {
    setCurrent((n + total) % total)
  }, [])

  if (loading) return <div className={styles.skeleton} />

  return (
    <div className={styles.wrapper}>

      <div className={styles.hero}>
        {slides.length === 0 ? (
          <div className={styles.empty}>
            <span>🖼</span>
            <p>No hay imágenes aún</p>
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${i === current ? styles.active : ''}`}
            >
              <img src={slide.url} alt={`Slide ${i + 1}`} className={styles.img} />
              <div className={styles.overlay} />
              {isAdmin && (
                <button
                  className={styles.deleteSlide}
                  onClick={() => handleDelete(slide.id, slide.url)}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))
        )}

        {slides.length > 0 && (
          <div className={styles.content}>
            <p className={styles.tag}>Cuchillería artesanal</p>
            <h1 className={styles.slogan}>{slogan}</h1>
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button className={`${styles.nav} ${styles.prev}`} onClick={() => goTo(current - 1, slides.length)}>
              <ChevronIcon dir="left" />
            </button>
            <button className={`${styles.nav} ${styles.next}`} onClick={() => goTo(current + 1, slides.length)}>
              <ChevronIcon dir="right" />
            </button>
            <div className={styles.dots}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                  onClick={() => goTo(i, slides.length)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <div className={styles.adminPanel}>
          <p className={styles.adminLabel}>Carrusel hero</p>

          <div className={styles.thumbRow}>
            {slides.map((slide, i) => (
              <img
                key={slide.id}
                src={slide.url}
                alt={`Miniatura ${i + 1}`}
                className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
                onClick={() => goTo(i, slides.length)}
              />
            ))}
            <label className={`${styles.uploadBtn} ${uploading ? styles.disabled : ''}`}>
              {uploading ? 'Subiendo...' : '+ Subir imagen'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className={styles.sloganRow}>
            <input
              type="text"
              value={sloganInput}
              onChange={e => setSloganInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveSlogan()}
              placeholder="Título / slogan..."
              className={styles.sloganInput}
            />
            <button className={styles.saveBtn} onClick={saveSlogan}>
              Guardar
            </button>
            {saved && (
              <span className={styles.savedBadge}>
                ✓ Guardado
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ dir }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}