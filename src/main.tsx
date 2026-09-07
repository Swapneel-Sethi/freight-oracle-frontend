import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: any}> {
  state = { error: null as any }
  static getDerivedStateFromError(error: any) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#fff', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#DC2626' }}>Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#F59E0B' }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#8B8FA3', fontSize: 12 }}>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const App = React.lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<div style={{color:'#fff',padding:40}}>Loading...</div>}>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)
