/**
 * 📚 CONCEITO: Error Boundaries
 *
 * Error Boundaries são componentes de CLASSE (não podem ser funções) que capturam
 * erros de JavaScript em qualquer lugar da sua árvore de componentes filhos.
 * Sem Error Boundaries, um erro em qualquer componente desmonta toda a aplicação.
 *
 * IMPORTANTE: Error Boundaries NÃO capturam:
 * - Erros em event handlers (use try/catch normal)
 * - Erros assíncronos (Promises, async/await)
 * - Erros no próprio Error Boundary
 * - Erros em Server Components
 *
 * Em entrevistas: saiba que com React 19 virá uma API de hooks para Error Boundaries,
 * mas por enquanto componentes de classe ainda são necessários para este pattern.
 *
 * Em Next.js 14, a diretiva 'error.tsx' é a solução recomendada para rotas,
 * mas Error Boundaries ainda são úteis para sub-árvores de componentes.
 */
'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  // Componente customizado para exibir quando há erro
  fallback?: ReactNode;
  // Callback chamado quando um erro é capturado (ex: enviar para Sentry)
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // getDerivedStateFromError: chamado quando um erro é lançado por um filho.
  // Atualiza o estado para exibir o fallback na próxima renderização.
  // É estático porque não deve ter efeitos colaterais.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // componentDidCatch: chamado após o render do fallback.
  // Use para logging de erros em serviços como Sentry, Datadog, etc.
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  // Permite "resetar" o Error Boundary para tentar novamente
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Se um fallback customizado foi fornecido, usa ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão com opção de tentar novamente
      return (
        <div style={{
          padding: '24px',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          textAlign: 'center',
          margin: '16px',
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>
            Algo deu errado nesta seção
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente wrapper funcional para uso conveniente.
 * Permite usar Error Boundary como componente JSX sem instanciar a classe manualmente.
 */
export function WithErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
