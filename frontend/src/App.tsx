import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Search from './pages/Search';
import Stats from './pages/Stats';
import Gallery from './pages/Gallery';
import Ranking from './pages/Ranking';

export default function App() {
  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}