/**
 * Providers globais da aplicação.
 *
 * No Next.js App Router, o RootLayout é um Server Component por padrão.
 * Providers que usam contexto React (como ApolloProvider) precisam
 * ser Client Components ('use client'). Por isso extraímos os providers
 * para um arquivo separado.
 *
 * Padrão comum em projetos Next.js 14: criar um Providers.tsx
 * com 'use client' que envolve os children com todos os providers necessários.
 */
'use client';

import { ApolloProvider } from '@apollo/client';
import { makeClient } from '@/lib/apollo-client';
import { AppProvider } from '@/context/AppContext';
import { useMemo } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // useMemo: garante que o Apollo Client seja criado apenas uma vez
  // e não recriado a cada render do componente Providers.
  const client = useMemo(() => makeClient(), []);

  return (
    <ApolloProvider client={client}>
      {/* AppProvider: nosso Context global de estado da aplicação */}
      <AppProvider>
        {children}
      </AppProvider>
    </ApolloProvider>
  );
}
