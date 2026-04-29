export default function SearchBar({filter, setFilter}) {
    return (
        <div className="flex gap-4">
            <input
                type="text"
                placeholder="Cerca..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 p-4 rounded-xl border border-slate-700 bg-slate-800 text-white shadow-sm focus:ring-easygig-accent outline-none placeholder-slate-400"
            />
            <select className="p-4 rounded-xl border border-slate-700 bg-slate-800 text-white shadow-sm outline-none cursor-pointer" id="category">
                <option value="">Tutte le zone</option>
                <option value="Roma">Roma</option>
                <option value="Milano">Milano</option>
                <option value="Bologna">Bologna</option>
            </select>
        </div>
    )
}