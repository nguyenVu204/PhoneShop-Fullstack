import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="103898339045-oq5ui1giddsr6q9fp4l24cnsllhnjg28.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)