/**
 * Lista de usuários monitorados.
 * Demonstra useCallback para handlers de eventos memoizados.
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries/users';
import { DELETE_USER } from '@/graphql/mutations/users';
import { User } from '@/types';
import { useAppActions } from '@/context/AppContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#7c3aed',
  MANAGER: '#d97706',
  EMPLOYEE: '#059669',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Funcionário',
};

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { selectUser } = useAppActions();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: { role: selectedRole || undefined, search: searchTerm || undefined },
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    // refetchQueries: após deletar, busca novamente a lista de usuários
    // para refletir a mudança no cache do Apollo
    refetchQueries: [{ query: GET_USERS }],
  });

  /**
   * useCallback: memoiza o handler de clique para que o componente filho
   * UserRow (se fosse memoizado com React.memo) não rerendere ao passar onSelect.
   * O handler é recriado apenas quando selectUser muda.
   */
  const handleSelectUser = useCallback(
    (user: User) => {
      selectUser(user);
    },
    [selectUser],
  );

  /**
   * useCallback para delete: inclui userId como dependência porque
   * cada chamada precisa do ID correto do usuário a deletar.
   * Sem useCallback, uma nova função seria criada para cada usuário a cada render.
   */
  const handleDeleteUser = useCallback(
    async (userId: string) => {
      if (!confirm('Tem certeza que deseja remover este usuário?')) return;
      try {
        await deleteUser({ variables: { id: userId } });
      } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        alert('Erro ao deletar usuário. Verifique o console.');
      }
    },
    [deleteUser],
  );

  /**
   * useMemo: filtra a lista de usuários no cliente para busca instantânea.
   * Evita recalcular o array filtrado a cada render.
   * Nota: em listas grandes, considere delegar o filtro ao servidor (já feito via GraphQL).
   */
  const users: User[] = useMemo(() => data?.users || [], [data?.users]);

  if (loading) return <LoadingSpinner message="Carregando usuários..." />;
  if (error) return <div style={{ color: '#ef4444', padding: 16 }}>Erro: {error.message}</div>;

  return (
    <div>
      {/* Barra de filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ ...inputStyle, maxWidth: 180 }}
        >
          <option value="">Todos os cargos</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Gerente</option>
          <option value="EMPLOYEE">Funcionário</option>
        </select>
        <button onClick={() => refetch()} style={buttonStyle}>
          Atualizar
        </button>
      </div>

      {/* Contagem */}
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
        {users.length} usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
      </p>

      {/* Tabela de usuários */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Nome', 'E-mail', 'Cargo', 'Cadastrado em', 'Ações'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: ROLE_COLORS[user.role] + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: ROLE_COLORS[user.role],
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>{user.email}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    backgroundColor: ROLE_COLORS[user.role] + '15',
                    color: ROLE_COLORS[user.role],
                  }}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleSelectUser(user)}
                      style={{ ...actionBtn, color: '#3b82f6' }}
                    >
                      Detalhes
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{ ...actionBtn, color: '#ef4444' }}
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  flex: 1,
  minWidth: 200,
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#111827',
};

const actionBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: 4,
};
