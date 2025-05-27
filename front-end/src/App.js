import { BrowserRouter, Routes, Route } from "react-router-dom"; // 4 Routing
import { AuthProvider } from "./context/AuthContext"; // 4 app authentication state
import PrivateRoute from "./components/PrivateRoute"; // 4 protecting private routes
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Post from "./pages/Post";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import "./App.css";

export default function App() {
  // Wrap the app with AuthProvider to provide auth state to all components
  return (
    <AuthProvider>
      {/* Enable BrowseRouter to enable navigation & routing in the app */}
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<Post />} />
          <Route path="/" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />

          {/* SECURITY GUARD: Wrapping protected routes in PrivateRoute to restrict access */}
          {/* ie: "Hey these 2 routes should only be seen by logged-in users, if not don't let them in." */}
          <Route element={<PrivateRoute />}>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-post" element={<EditPost />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
