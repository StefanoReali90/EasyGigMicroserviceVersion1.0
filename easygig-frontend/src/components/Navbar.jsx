const Navbar = () => {
    return (
        <nav className="w-full py-4 px-8 bg-slate-800/50 backdrop-blur-md flex justify-between items-center border-b border-slate-700 sticky top-0">
            {/* Parte Sinistra: Il Logo */}
            <div className="text-2xl font-bold text-white">
                Easy<span className="text-blue-500">GIG</span>
            </div>

            {/* Parte Destra: I Link */}
            <div className="space-x-6 text-slate-300">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#" className="hover:text-white transition-colors">Cerca Band</a>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                    Accedi
                </button>
            </div>
        </nav>
    )
}

export default Navbar
