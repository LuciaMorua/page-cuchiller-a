import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ProductModal.module.css'

export default function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    in_stock: product?.in_stock ?? true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('productos')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function save() {
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setError('Completá nombre, categoría y precio')
      return
    }

    setSaving(true)
    setError('')

    try {
      let image_url = product?.image_url || null

      if (imageFile) {
        image_url = await uploadImage(imageFile)
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: parseFloat(form.price),
        image_url,
        in_stock: form.in_stock,
      }

      let data, err

      if (product) {
        ;({ data, error: err } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id)
          .select()
          .single())
      } else {
        ;({ data, error: err } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single())
      }

      if (err) throw err

      onSaved(data)
    } catch (err) {
      console.error(err)
      setError('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3>{product ? 'Editar producto' : 'Nuevo producto'}</h3>

        <div className={styles.formGroup}>
          <label>Nombre *</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ej: Vela aromática" />
        </div>

        <div className={styles.formGroup}>
          <label>Descripción</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="Breve descripción del producto" />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Categoría *</label>
            <input value={form.category} onChange={e => update('category', e.target.value)} placeholder="Ej: Hogar" />
          </div>
          <div className={styles.formGroup}>
            <label>Precio ($) *</label>
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Foto del producto</label>
          <div className={styles.uploadArea}>
            {imagePreview ? (
              <div className={styles.previewWrap}>
                <img src={imagePreview} alt="preview" className={styles.preview} />
                <button
                  className={styles.removeImg}
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  type="button"
                >
                  × Quitar foto
                </button>
              </div>
            ) : (
              <label className={styles.uploadLabel} htmlFor="fileInput">
                <div className={styles.uploadIcon}>📷</div>
                <div className={styles.uploadText}>Hacé clic para subir una foto</div>
                <div className={styles.uploadHint}>JPG, PNG o WEBP · máx 5MB</div>
              </label>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Estado inicial</label>
          <div className={styles.stockToggle}>
            <button
              className={`${styles.stockBtn} ${form.in_stock ? styles.inStock : ''}`}
              onClick={() => update('in_stock', true)}
              type="button"
            >
              ✓ Con stock
            </button>
            <button
              className={`${styles.stockBtn} ${!form.in_stock ? styles.noStock : ''}`}
              onClick={() => update('in_stock', false)}
              type="button"
            >
              ✗ Sin stock
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={save} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>
      </div>
    </div>
  )
}