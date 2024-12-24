import { Outlet } from "react-router-dom";
import "./index.css";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/Link/context";


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

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={<Login />} />
//       <Route element={<Layout />}>
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/leaderboard" element={<LeaderBoard />} />
//         <Route path="/game" element={<Game />} />
//         <Route path="*" element={<Error />} />
//       </Route>
//     </Routes>
//   );
// }

export default App;
