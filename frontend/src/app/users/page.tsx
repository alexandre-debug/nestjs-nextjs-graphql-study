/**
 * Página de Usuários — lista e cadastro de usuários monitorados.
 *
 * Demonstra side-by-side os dois padrões:
 * Controlled Component vs Uncontrolled Component
 */
'use client';

import React from 'react';
import { UsersList } from '@/components/Users/UsersList';
import { ControlledUserForm, UncontrolledUserForm } from '@/components/Users/UserForm';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAppState, useAppActions } from '@/context/AppContext';

export default function UsersPage() {
  const { selectedUser } = useAppState();
  const { selectUser } = useAppActions();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700 }}>
          Usuários Monitorados
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
          Gerencie os funcionários cadastrados no sistema de monitoramento
        </p>
      </div>

      {/* Seção: Controlled vs Uncontrolled — comparação lado a lado */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 16, color: '#92400e' }}>
          📚 Estudo: Controlled vs Uncontrolled Components
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
          Os dois formulários abaixo criam usuários, mas usam padrões diferentes.
          Observe que o formulário controlado valida em tempo real enquanto você digita,
          enquanto o não-controlado só valida no submit.
        </p>

        <WithErrorBoundary>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <ControlledUserForm />
            <UncontrolledUserForm />
          </div>
        </WithErrorBoundary>
      </div>

      {/* Lista de usuários */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>
          Lista de Usuários
        </h2>
        <WithErrorBoundary>
          <UsersList />
        </WithErrorBoundary>
      </div>

      {/* Painel de detalhes do usuário selecionado (via Context) */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          padding: 24,
          overflowY: 'auto',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Detalhes do Usuário</h3>
            <button
              onClick={() => selectUser(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#3b82f615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: '#3b82f6',
              margin: '0 auto',
            }}>
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>

            {[
              { label: 'Nome', value: selectedUser.name },
              { label: 'E-mail', value: selectedUser.email },
              { label: 'Cargo', value: selectedUser.role },
              { label: 'Cadastrado em', value: new Date(selectedUser.createdAt).toLocaleDateString('pt-BR') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                  {label}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#111827' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
