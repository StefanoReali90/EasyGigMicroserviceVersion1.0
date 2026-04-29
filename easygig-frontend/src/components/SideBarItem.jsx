
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ to, icon: Icon, label, isOpen }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 mb-2 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? 'bg-easygig-accent text-white shadow-lg shadow-indigo-500/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {/* Icona passata come prop */}
      <Icon className="w-6 h-6 min-w-[24px]" />

      {/* Label che appare solo se la sidebar è aperta */}
      {isOpen && (
        <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
          {label}
        </span>
      )}

      {/* Tooltip che appare solo se la sidebar è CHIUSA */}
      {!isOpen && (
        <div className="absolute left-20 bg-slate-900 text-white p-2 rounded-md text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </NavLink>
  );
};
export default SidebarItem;
