import { Link, Outlet } from "react-router-dom";

export default function Root() {
    return (
        <div>
            <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
                <ul style={{ display: "flex", gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">Sobre</Link></li>
                    {/* Aqui você vai adicionar mais links depois: Dashboard, Login, etc. */}
                </ul>
            </nav>
            <main style={{ padding: "2rem" }}>
                <Outlet /> {/* ← As páginas filhas aparecem aqui */}
            </main>
        </div>
    );
}