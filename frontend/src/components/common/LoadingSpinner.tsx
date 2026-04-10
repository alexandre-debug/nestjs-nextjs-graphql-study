'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = 'Carregando...', size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = { sm: 24, md: 40, lg: 64 };
  const px = sizeMap[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 24 }}>
      <div
        style={{
          width: px,
          height: px,
          border: `3px solid #e5e7eb`,
          borderTop: `3px solid #3b82f6`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {message && <p style={{ color: '#6b7280', fontSize: 14 }}>{message}</p>}
    </div>
  );
}
