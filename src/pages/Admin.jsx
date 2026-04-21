import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProductModal from '../components/ProductModal.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import styles from './Admin.module.css'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    let ignore = false

    async function load() {
      setLoadingProducts(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!ignore) {
        setProducts(data || [])
        setLoadingProducts(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [session])

  async function login() {
    if (!email || !password) {
      setLoginError('Completá email y contraseña')
      return
    }

    setLoggingIn(true)
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setLoginError('Email o contraseña incorrectos')
      setLoggingIn(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setProducts([])
  }

  async function toggleStock(product) {
    const { data } = await supabase
      .from('products')
      .update({ in_stock: !product.in_stock })
      .eq('id', product.id)
      .select()
      .single()

    if (data) {
      setProducts(prev =>
        prev.map(p => p.id === data.id ? data : p)
      )
    }
  }

  async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      if (product?.image_url) {
        const path = product.image_url.split('/productos/')[1]

        if (path) {
          const { error: storageError } = await supabase.storage
            .from('productos')
            .remove([path])

          if (storageError) throw storageError
        }
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setProducts(prev => prev.filter(p => p.id !== id))

    } catch (error) {
      console.error(error)
      alert('Error al eliminar producto')
    }
  }

  function openAdd() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  function onSaved(saved) {
    setProducts(prev => {
      const exists = prev.find(p => p.id === saved.id)

      return exists
        ? prev.map(p => p.id === saved.id ? saved : p)
        : [saved, ...prev]
    })

    setModalOpen(false)
  }

  if (loadingSession) {
    return (
      <div className={styles.loading}
        style={{ padding: '4rem', textAlign: 'center' }}>
        Cargando...
      </div>
    )
  }

  if (!session) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <h2>Panel de vendedor</h2>
          <p>Ingresá con tu cuenta para gestionar el stock</p>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="tu@email.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
          </div>

          <button
            className={styles.btnPrimary}
            onClick={login}
            disabled={loggingIn}
          >
            {loggingIn ? 'Ingresando...' : 'Ingresar'}
          </button>

          {loginError && (
            <p className={styles.errorMsg}>{loginError}</p>
          )}
        </div>
      </div>
    )
  }

  const inStock = products.filter(p => p.in_stock).length
  const outStock = products.filter(p => !p.in_stock).length
  const cats = new Set(products.map(p => p.category)).size

  return (
    <div className={styles.wrap}>

      <div className={styles.adminHeader}>
        <div>
          <h2>Gestión de productos</h2>
          <p>{session.user.email}</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnAdd} onClick={openAdd}>
            + Nuevo producto
          </button>

          <button className={styles.btnLogout} onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <HeroCarousel isAdmin={true} />

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total</div>
          <div className={styles.statNum}>{products.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Con stock</div>
          <div className={`${styles.statNum} ${styles.green}`}>
            {inStock}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Sin stock</div>
          <div className={`${styles.statNum} ${styles.red}`}>
            {outStock}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Categorías</div>
          <div className={styles.statNum}>{cats}</div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loadingProducts ? (
          <div className={styles.loading}>Cargando...</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <div>📦</div>
            <p>Aún no tenés productos</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbEmpty}>📷</div>
                    )}
                  </td>

                  <td>
                    <div className={styles.rowName}>{p.name}</div>
                    <div className={styles.rowDesc}>
                      {p.description?.substring(0, 45)}...
                    </div>
                  </td>

                  <td>
                    <span className={styles.catTag}>
                      {p.category}
                    </span>
                  </td>

                  <td className={styles.rowPrice}>
                    ${p.price.toLocaleString('es-AR')}
                  </td>

                  <td>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={p.in_stock}
                        onChange={() => toggleStock(p)}
                      />
                      <div className={styles.track}></div>
                      <div className={styles.thumb}></div>
                    </label>

                    <div className={`${styles.stockLabel} ${
                      p.in_stock ? styles.green : styles.red
                    }`}>
                      {p.in_stock ? 'Con stock' : 'Sin stock'}
                    </div>
                  </td>

                  <td>
                    <button
                      className={styles.btnEdit}
                      onClick={() => openEdit(p)}
                    >
                      Editar
                    </button>

                    <button
                      className={styles.btnDelete}
                      onClick={() => deleteProduct(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}

    </div>
  )
}