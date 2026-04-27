// Destrutturiamo le props: prendiamo 'title' e 'description'
import {useState} from "react";

const FeatureCard = ({ title, description, icon }) => {
    const [likes, setLikes] = useState(0);
    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all shadow-xl group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-slate-400">{description}</p>
            <button onClick={()=> setLikes(likes +1)} className="mt-4 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full text-sm transition-colors">❤️ {likes}</button>
        </div>
    )
}

export default FeatureCard
