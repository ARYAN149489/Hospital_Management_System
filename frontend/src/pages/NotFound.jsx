import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: '32px', maxWidth: '400px' }}>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );
}
