import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-low)', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '120px', fontWeight: 800, color: 'var(--surface-high)', lineHeight: 1, marginBottom: '24px' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', marginBottom: '12px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: '32px', maxWidth: '400px' }}>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );
}
