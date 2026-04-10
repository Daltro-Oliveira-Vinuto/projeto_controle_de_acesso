import { createBrowserRouter } from "react-router-dom";

import Root from "./pages/Root";
import Home from "./pages/Home";
import About from "./pages/About";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },           // rota "/"
            { path: "about", element: <About /> },        // rota "/about"
            // ← Adicione aqui suas próximas rotas (login, dashboard, etc.)
        ],
    },
]);

export default router;