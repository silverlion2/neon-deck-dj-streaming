import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveDeck from "@/pages/LiveDeck";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LiveDeck />} />
      </Routes>
    </Router>
  );
}
