import { Outlet } from "react-router-dom";
import "./index.css";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/Link/context";

import { useEffect } from "react";
import { useThemeStore } from "./store";

const httpLink = createHttpLink({ uri: "/graphql" });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    ...headers,
    Authorization: token ? `Bearer ${token}` : "",
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Update the data-theme attribute on the <html> element when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ApolloProvider client={client}>
      <>
        <main>
          <Outlet />
        </main>
      </>
    </ApolloProvider>
  );
}

export default App;
