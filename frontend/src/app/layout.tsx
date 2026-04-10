/**
 * RootLayout — layout raiz do Next.js App Router.
 *
 * Este é um Server Component (sem 'use client').
 * Define o HTML base e injeta os Providers (Client Components).
 *
 * Todos os layouts e páginas filhas herdam este layout automaticamente.
 */
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'nestjs-nextjs-graphql-study Study — Monitor de Atividades',
  description: 'Dashboard de monitoramento de atividades de funcionários',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#111827',
      }}>
        <Providers>
          {/* Sidebar de navegação */}
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

// Sidebar: Server Component (sem interatividade, apenas layout)
function Sidebar() {
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/users', label: 'Usuários', icon: '👥' },
    { href: '/activities', label: 'Atividades', icon: '📋' },
  ];

  return (
    <aside style={{
      width: 220,
      backgroundColor: '#1f2937',
      color: '#f9fafb',
      padding: '24px 0',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #374151' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f9fafb' }}>
          🔍 nestjs-nextjs-graphql-study
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
          Monitor de Atividades
        </p>
      </div>

      <nav style={{ marginTop: 16 }}>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              textDecoration: 'none',
              color: '#d1d5db',
              fontSize: 14,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.backgroundColor = '#374151')}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.backgroundColor = 'transparent')}
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div style={{ padding: '20px', position: 'absolute', bottom: 0, width: 180 }}>
        <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Projeto de Estudo<br />Entrevista Técnica<br />NestJS + Next.js
        </p>
      </div>
    </aside>
  );
}
