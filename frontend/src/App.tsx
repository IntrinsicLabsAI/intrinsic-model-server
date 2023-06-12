import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workspace from './pages/Workspace';

function App() {
    return (
        <Routes>
            <Route path="" element={<Workspace />}>
              <Route index={true} element={<Home />} />
            </Route>
        </Routes>
    )
}

export default App;