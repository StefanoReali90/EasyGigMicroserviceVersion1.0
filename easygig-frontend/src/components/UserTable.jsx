import React from 'react';
import { MoreHorizontal, UserCheck, UserX, ExternalLink } from 'lucide-react';

const UserTable = ({ users = [] }) => {
  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Recent Users</h3>
        <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
          View all <ExternalLink size={12} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-widest">
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length > 0 ? users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                      {u.firstName ? u.firstName[0] : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                    {u.role || 'GUEST'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <UserCheck size={14} />
                    Active
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic text-sm">
                  No users found. Connect your backend or register your first user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
