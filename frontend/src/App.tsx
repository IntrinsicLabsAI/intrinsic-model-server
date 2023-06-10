import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Workspace from './pages/Workspace';

function App() {
    return (
        <Routes>
            <Route path="" element={<Workspace />}>
              <Route path="home" element={<Home />} />
            </Route>
        </Routes>
    )
};

export default App;