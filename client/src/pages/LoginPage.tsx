import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import type { LoginRequest } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GraduationCap, Lock, User as UserIcon } from "lucide-react";

function LoginPage () {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const { signin, errors: loginErrors, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() =>{
        if(isAuthenticated) navigate("/");
    }, [isAuthenticated, navigate]);

    const onSubmit = handleSubmit(async (values) => {
        signin(values)
    });

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-10 rounded-2x1 shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 p-3 font-sans">CapacitApp</h1>
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mb-3">
                        <GraduationCap size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 font-mono">Bienvenido de nuevo</h2>
                    <p className="text-gray-400 text-sm mt-1 font-serif">Ingresa tus credenciales para acceder.</p>
                </div>

                {loginErrors.map((error, i) => (
                    <div className="bg-red-500 text-white p-2 text-center rounded-md mb-4 text-sm" key={i}>
                        {error}
                    </div>
                ))}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="text"
                                {...register("username", { required: true})}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="Ej. admin"
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs mt-1">El usuario es requerido</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="password"
                                {...register("password", { required: true})}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="......"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">La contraseña es requerida</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md"
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;