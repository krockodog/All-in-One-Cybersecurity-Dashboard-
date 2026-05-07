import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

if (!backendUrl) {
  throw new Error("Missing REACT_APP_BACKEND_URL");
}

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const httpLink = new HttpLink({
  uri: `${backendUrl}/graphql`,
  credentials: "include"
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});
