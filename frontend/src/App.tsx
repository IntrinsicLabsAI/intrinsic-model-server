import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import NotFound from './pages/NotFound';
import Model from './pages/Model';
import NewModel from './pages/NewModel';
import Overview from './pages/Model/Overview';
import Experiments from './pages/Model/Experiments';

function App() {
    return (
        <Routes>
            <Route element={<Workspace />}>
                <Route index={true} element={<Home />} />
                <Route path="model/:name" element={<Model />}>
                    <Route index element={<Overview />} />
                    <Route path="experiments" element={<Experiments />} />
                </Route>
                <Route path="new-model" element={<NewModel />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App;