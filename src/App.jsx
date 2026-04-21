import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Store from './pages/Store.jsx'
import Admin from './pages/Admin.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </>
  )
}