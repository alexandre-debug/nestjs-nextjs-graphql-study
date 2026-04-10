/**
 * 📚 CONCEITO: Apollo Client com Next.js App Router
 *
 * O App Router do Next.js 14 usa React Server Components (RSC) por padrão.
 * Apollo Client é uma biblioteca de estado do cliente, então precisamos
 * configurá-la com cuidado para funcionar em ambos os ambientes:
 * - Server Components: podem usar o Apollo diretamente para SSR
 * - Client Components: usam o ApolloProvider com a instância do cliente
 *
 * A biblioteca @apollo/experimental-nextjs-app-support resolve isso
 * com o ApolloNextAppProvider que gerencia o estado correto para cada ambiente.
 *
 * Para Subscriptions, usamos graphql-ws via WebSocket em vez de HTTP.
 */
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const HTTP_URL = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:3001/graphql';
const WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:3001/graphql';

/**
 * Cria o Apollo Client com suporte a Subscriptions via WebSocket.
 *
 * split() direciona a requisição para o link correto:
 * - Se for subscription → WebSocket (WsLink)
 * - Se for query ou mutation → HTTP (HttpLink)
 */
export function makeClient() {
  // Link HTTP para queries e mutations
  const httpLink = new HttpLink({
    uri: HTTP_URL,
  });

  // Link WebSocket para subscriptions (apenas no browser)
  // typeof window !== 'undefined' garante que só criamos o WsLink no cliente
  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: WS_URL,
            retryAttempts: 5, // reconecta automaticamente se a conexão cair
          }),
        )
      : null;

  // split: roteador de links baseado no tipo de operação GraphQL
  const splitLink =
    wsLink != null
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            // Rota para WebSocket apenas se for subscription
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            );
          },
          wsLink,
          httpLink,
        )
      : httpLink;

  return new ApolloClient({
    // InMemoryCache: cache normalizado por tipo e ID.
    // Quando você busca um User com id="123", o Apollo armazena
    // e reutiliza em outros lugares que referenciam o mesmo User.
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          keyFields: ['id'], // campo identificador para normalização
        },
        ActivityLog: {
          keyFields: ['id'],
        },
      },
    }),
    link: splitLink,
  });
}
