/**
 * Tipos TypeScript compartilhados no frontend.
 * Espelham as entidades do backend para garantir consistência de tipos.
 * Em produção, geraríamos estes tipos automaticamente com GraphQL Code Generator.
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  activityLogs?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  user?: User;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

// Tipo para os dados do gráfico de atividades
export interface ActivityChartData {
  time: string;
  count: number;
  action?: string;
}
