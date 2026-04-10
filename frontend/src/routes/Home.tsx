import { useEffect, useState } from "react";
import { getUsers } from "../services/users";

export default function Home() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    return (
        <div>
            <h1> Bem-Vindo ao Control de acesso </h1>
            <h1>Users</h1>

            {users.map((user) => (
                <p key={user.id}>{user.username}</p>
            ))}
        </div>
    );
}