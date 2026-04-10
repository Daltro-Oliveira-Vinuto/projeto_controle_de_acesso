import { createBrowserRouter } from "react-router-dom";

import Root from "./routes/Root";
import Home from "./routes/Home";
import About from "./routes/About";
import ErrorPage from "./routes/ErrorPage";

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