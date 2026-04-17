// src/pages/Root.tsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Root() {
    return (
        <>
            <Navbar />
            <main style={{ padding: 24 }}>
                <Outlet />
            </main>
        </>
    );
}