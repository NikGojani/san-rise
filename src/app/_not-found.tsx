export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      color: '#111',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Seite nicht gefunden</h1>
      <p style={{ fontSize: '1.25rem', color: '#888' }}>Die angeforderte Seite existiert nicht.</p>
    </div>
  );
} 