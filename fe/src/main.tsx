import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Tắt StrictMode để tránh double render trong development
// StrictMode chỉ nên dùng khi test, không nên dùng trong production
createRoot(document.getElementById('root')!).render(
    <App />
)
