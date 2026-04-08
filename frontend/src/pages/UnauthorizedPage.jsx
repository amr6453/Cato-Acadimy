import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const UnauthorizedPage = () => (
  <div
    style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}
    className="animate-fade-in"
  >
    <div style={{ textAlign: 'center', maxWidth: '420px' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <ShieldOff size={36} color="var(--red)" />
      </div>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: 'var(--navy)',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
        }}
      >
        Access Denied
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--gray-500)',
          marginBottom: '32px',
          lineHeight: 1.7,
        }}
      >
        You don't have permission to view this page. This area is restricted to instructors and administrators only.
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  </div>
);

export default UnauthorizedPage;
