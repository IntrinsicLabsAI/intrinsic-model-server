import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Model from './pages/Model';

function App() {
    return (
        <Routes>
            <Route path="" element={<Workspace />}>
              <Route index={true} element={<Home />} />
              <Route path="model" element={<Model />} />
            </Route>
        </Routes>
    )
}

export default App;