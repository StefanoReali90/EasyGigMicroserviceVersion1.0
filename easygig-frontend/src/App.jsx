import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterProfile from './pages/RegisterProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-profile" element={<RegisterProfile />} />
    </Routes>
  );
}

export default App;