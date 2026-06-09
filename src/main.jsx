import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. Importas inject desde el paquete general
import { inject } from '@vercel/analytics';

// 2. Ejecutas la función para que empiece a trackear
inject();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)