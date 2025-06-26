import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // required for styling

function App() {
  return (
    <div className="app">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
