import { LogOut } from "lucide-react";

export function UserProfileCard() {
  return (
    <div className="p-4 border-t border-slate-200/50">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 text-xs font-medium">
          JD
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900 transition-colors">
            John Doe
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            john@budgetme.site
          </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" aria-label="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
