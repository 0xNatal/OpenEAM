// Apollo Client setup: talks to the API's /graphql endpoint (same-origin in dev
// via the Vite proxy, or VITE_API_URL in a build) with a normalized in-memory cache.
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const apiBase = import.meta.env.VITE_API_URL ?? '';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: `${apiBase}/graphql` }),
  cache: new InMemoryCache(),
});
