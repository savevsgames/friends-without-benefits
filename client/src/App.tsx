import { Outlet, Route, Routes } from "react-router-dom";

import Header from "./components/Header.tsx";
// import Footer from "./components/Footer.tsx";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Error from "./pages/Error.tsx";
import Game from "./pages/Game.tsx";
import LeaderBoard from "./pages/LeaderBoard";
import Profile from "./pages/Profile.tsx";
import Login from "./pages/Login.tsx";
import {
  ApolloProvider, 
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import {setContext} from "@apollo/client/Link/context";

const httpLink = createHttpLink({uri: '/graphql'})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token")
  return {
    ...headers,
    Authorization: token ? `bEARER ${token}` : ""
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


function Layout() {
  return (
    <ApolloProvider client={client}>
      <>
        <Header />
        <main>
          <Outlet />
        </main>
      </>
    </ApolloProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;
