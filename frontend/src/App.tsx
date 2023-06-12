import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import ModelPage from './pages/ModelPage';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Routes>
            <Route element={<Workspace />}>
                <Route index={true} element={<Home />} />
                <Route path="model/:name" element={<ModelPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App;