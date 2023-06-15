import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import NotFound from './pages/NotFound';
import Model from './pages/Model';

function App() {
    return (
        <Routes>
            <Route element={<Workspace />}>
                <Route index={true} element={<Home />} />
                <Route path="model/:name" element={<Model />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App;