import React, { useState } from 'react';
import { Card } from '../../components/common';
import logindetails from '../../JSONFiles/logindetails.json';
import { useNavigate } from 'react-router-dom';
import useUser from '../../components/layout/useUser';

const Login = () => {
    // using states to store username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const setusername = useUser((state) => state.setusername);
    const setrole = useUser((state) => state.setrole);

    const navigate = useNavigate();

    const handleLogin = () => {
        const user = logindetails.find(
            (u) => u.username === username && u.password === password
        );

        if (user) {
            // Store the user ID in local storage
            localStorage.setItem('useridloggedin', user._id);
            setusername(user.username) // I know this is bad practice

            // Navigate based on role
            if (user.role === 'patient') {
                navigate('/patientDashboard/dashboard');
            } else if (user.role === 'doctor') {
                navigate('/docDashboard');
            } else if (user.role === 'receptionist') {
                navigate('/dashboard');
            }
        } else {
            alert('Invalid User credentials');
        }
    };

    return (
        <Card className="p-6 max-w-md mx-auto mt-10">
            <div className="shrink-0 p-4 border-b">
                <div className="flex items-center justify-center">
                    <h1 className="text-xl font-bold">
                        <span className="text-blue-600">Health</span>
                        <span className="text-green-500">Care</span>
                    </h1>
                </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-4 shrink-0 p-4">Login</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter your username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </Card>
    );
};

export default Login;
