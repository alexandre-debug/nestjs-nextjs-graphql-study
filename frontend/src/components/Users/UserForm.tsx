/**
 * 📚 CONCEITO: Controlled vs Uncontrolled Components
 *
 * Este arquivo demonstra os DOIS padrões lado a lado para comparação clara.
 *
 * ==========================================================================
 * CONTROLLED COMPONENT (Componente Controlado):
 * - O React controla o valor do input via state (useState)
 * - Cada mudança dispara onChange → atualiza state → React rerendiza o input
 * - Você tem controle total: pode validar, formatar, bloquear entrada em tempo real
 * - Mais verboso, mas mais previsível e testável
 * - Usar quando: precisa de validação em tempo real, formatação, dependências entre campos
 *
 * UNCONTROLLED COMPONENT (Componente Não Controlado):
 * - O DOM gerencia o valor internamente (como HTML puro)
 * - Você acessa o valor via ref quando necessário (ex: no submit)
 * - Menos código, melhor performance para forms muito grandes
 * - Usar quando: forms simples, sem validação em tempo real, integração com bibliotecas externas
 * - React Hook Form usa esse padrão internamente para otimizar performance
 *
 * REGRA PRÁTICA: Em 90% dos casos, use Controlled. Use Uncontrolled apenas
 * quando tiver razão de performance comprovada ou integração legada.
 * ==========================================================================
 */
'use client';

import React, { useState, useRef, FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '@/graphql/mutations/users';
import { GET_USERS } from '@/graphql/queries/users';

// ============================================================
// 1. CONTROLLED COMPONENT — formulário com estado React controlado
// ============================================================

interface ControlledFormState {
  name: string;
  email: string;
  role: string;
}

export function ControlledUserForm() {
  // Estado React controla cada campo — "single source of truth"
  const [formData, setFormData] = useState<ControlledFormState>({
    name: '',
    email: '',
    role: 'EMPLOYEE',
  });

  // Estado de validação em tempo real — SÓ possível com Controlled Components
  const [errors, setErrors] = useState<Partial<ControlledFormState>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  /**
   * Handler genérico: atualiza o campo correto no estado usando computed property.
   * Com Controlled Components, CADA tecla digitada passa por aqui.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Atualiza o valor do campo
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validação em TEMPO REAL — possível porque temos o valor sempre no estado
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors: Partial<ControlledFormState> = { ...errors };

    if (name === 'name' && value.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (name === 'name') {
      delete newErrors.name;
    }

    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = 'E-mail inválido';
    } else if (name === 'email') {
      delete newErrors.email;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    try {
      await createUser({ variables: { input: formData } });
      setFormData({ name: '', email: '', role: 'EMPLOYEE' });
      setSuccessMessage('Usuário criado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrors({ email: err.message });
    }
  };

  return (
    <div style={formContainerStyle}>
      <div style={formBadgeStyle('#3b82f6')}>
        Controlled Component
      </div>
      <p style={formDescStyle}>
        O React controla cada campo via <code>useState</code>.
        Validação acontece em tempo real a cada tecla.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          {/* O value={formData.name} é o que torna este campo "controlled" */}
          <input
            name="name"
            placeholder="Nome completo"
            value={formData.name} // ← Controlled: valor vem do React state
            onChange={handleChange} // ← obrigatório quando value é definido
            style={{ ...fieldStyle, borderColor: errors.name ? '#ef4444' : '#e5e7eb' }}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        <div>
          <input
            name="email"
            type="email"
            placeholder="E-mail corporativo"
            value={formData.email}
            onChange={handleChange}
            style={{ ...fieldStyle, borderColor: errors.email ? '#ef4444' : '#e5e7eb' }}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={fieldStyle}
        >
          <option value="EMPLOYEE">Funcionário</option>
          <option value="MANAGER">Gerente</option>
          <option value="ADMIN">Administrador</option>
        </select>

        <button type="submit" disabled={loading || Object.keys(errors).length > 0} style={submitStyle}>
          {loading ? 'Criando...' : 'Criar Usuário'}
        </button>

        {successMessage && (
          <p style={{ color: '#059669', fontSize: 13, textAlign: 'center' }}>{successMessage}</p>
        )}
      </form>
    </div>
  );
}

// ============================================================
// 2. UNCONTROLLED COMPONENT — formulário com refs (DOM nativo)
// ============================================================

export function UncontrolledUserForm() {
  // useRef: referência direta ao elemento DOM — sem rerender ao mudar
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  const [message, setMessage] = useState('');

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Acessa os valores via ref.current?.value — só no momento do submit
    const name = nameRef.current?.value || '';
    const email = emailRef.current?.value || '';
    const role = roleRef.current?.value || 'EMPLOYEE';

    // Validação apenas no submit (não em tempo real)
    if (name.length < 2 || !email.includes('@')) {
      setMessage('Dados inválidos. Verifique os campos.');
      return;
    }

    try {
      await createUser({ variables: { input: { name, email, role } } });
      // Limpa os campos diretamente no DOM
      if (nameRef.current) nameRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      setMessage('Usuário criado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div style={formContainerStyle}>
      <div style={formBadgeStyle('#f59e0b')}>
        Uncontrolled Component
      </div>
      <p style={formDescStyle}>
        O DOM controla os campos via <code>useRef</code>.
        Sem rerenders a cada tecla. Valor lido apenas no submit.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Sem value= aqui — o campo é "uncontrolled" (gerenciado pelo DOM) */}
        {/* defaultValue define o valor inicial sem vincular ao estado */}
        <input
          ref={nameRef}
          name="name"
          placeholder="Nome completo"
          defaultValue="" // defaultValue (não value) em uncontrolled
          style={fieldStyle}
        />

        <input
          ref={emailRef}
          type="email"
          placeholder="E-mail corporativo"
          defaultValue=""
          style={fieldStyle}
        />

        <select ref={roleRef} defaultValue="EMPLOYEE" style={fieldStyle}>
          <option value="EMPLOYEE">Funcionário</option>
          <option value="MANAGER">Gerente</option>
          <option value="ADMIN">Administrador</option>
        </select>

        <button type="submit" disabled={loading} style={{ ...submitStyle, backgroundColor: '#f59e0b' }}>
          {loading ? 'Criando...' : 'Criar Usuário'}
        </button>

        {message && (
          <p style={{ fontSize: 13, textAlign: 'center', color: message.includes('sucesso') ? '#059669' : '#ef4444' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

// ============================================================
// Estilos compartilhados
// ============================================================
const formContainerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  flex: 1,
  minWidth: 280,
};

const formBadgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 20,
  backgroundColor: color + '15',
  color: color,
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 10,
});

const formDescStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  marginBottom: 16,
  lineHeight: 1.5,
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const submitStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

const errorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: 12,
  marginTop: 4,
};
