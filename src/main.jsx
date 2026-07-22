import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'placeholder',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'localStorage' },
}

let msalInstance = null
try {
  msalInstance = new PublicClientApplication(msalConfig)
  await msalInstance.initialize()
} catch {
  msalInstance = null
}

function Providers({ children }) {
  const withMsal = msalInstance
    ? <MsalProvider instance={msalInstance}>{children}</MsalProvider>
    : children

  return googleClientId
    ? <GoogleOAuthProvider clientId={googleClientId}>{withMsal}</GoogleOAuthProvider>
    : withMsal
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
