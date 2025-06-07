import { BrowserRouter, Routes, Route } from "react-router-dom"; // 4 Routing
import { AuthProvider } from "./context/AuthContext"; // 4 app authentication state
import PrivateRoute from "./components/PrivateRoute"; // 4 protecting private routes
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Post from "./pages/Post";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import "./App.css";

export default function App() {
  // Wrap the app with AuthProvider to provide auth state to all components
  return (
    <AuthProvider>
      {/* Enable BrowseRouter to enable navigation & routing in the app */}
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<Post />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-post/:id" element={<CreatePost />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
