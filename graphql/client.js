import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { API_TOKEN, GRAPHQL_SERVER_URL } from '../consts/env';
import { onError } from '@apollo/client/link/error';

// Configuración HTTP con mayores tiempos de espera
const httpLink = new HttpLink({
  uri: GRAPHQL_SERVER_URL,
  fetchOptions: {
    timeout: 30000, // Timeout de 30 segundos
  },
});

console.log('Connecting to GraphQL endpoint:', GRAPHQL_SERVER_URL);
console.log('Using API Token:', API_TOKEN);

// Link de manejo de errores
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const operationName = operation.operationName;

  if (graphQLErrors) {
    console.log('GraphQL Errors:', JSON.stringify(graphQLErrors));
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(
        `[GraphQL Error] Operation: ${operationName}, Message: ${message}`,
        '\nLocations:',
        JSON.stringify(locations),
        '\nPath:',
        path,
        '\nExtensions:',
        JSON.stringify(extensions),
      );
    });
  }
  if (networkError) {
    console.log(
      `[Network Error] Operation: ${operationName}:`,
      JSON.stringify(networkError, null, 2),
    );
  }
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: API_TOKEN,
    },
  };
});

// Configuración de caché con políticas personalizadas
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        Channel: {
          merge(existing, incoming) {
            return incoming; // Siempre usar los datos entrantes
          }
        }
      }
    },
    Channel: {
      fields: {
        GetProducts: {
          merge(existing, incoming) {
            return incoming; // Siempre usar los datos entrantes para GetProducts
          }
        },
        GetProductsByIds: {
          keyArgs: ["product_ids"], // Usar product_ids como clave para la caché
          merge(existing, incoming) {
            return incoming; // Siempre usar los datos entrantes para GetProductsByIds
          }
        }
      }
    },
    Product: {
      // Asegurar que los productos se identifiquen por su id
      keyFields: ["id"],
      fields: {
        price: {
          // Estrategia de merge para el campo price
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    },
    Price: {
      // Definir cómo identificar y fusionar objetos Price
      // Como Price no tiene ID, usamos un campo calculado
      keyFields: false, // No usar campos para la identidad
      merge(existing, incoming) {
        return incoming; // Siempre usar los datos entrantes
      }
    },
    Image: {
      // Identificar imágenes por id
      keyFields: ["id"]
    },
    Variant: {
      // Identificar variantes por id
      keyFields: ["id"]
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: true, // Enable dev tools for better debugging
});

export default client;
