import { ArrowRight, Twitter, Github } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white pt-24 pb-12 px-6 relative z-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-y-12 gap-x-8 mb-24">
          {/* Branding */}
          <div className="col-span-full lg:col-span-4 lg:pr-12">
            <a href="#" className="inline-block mb-2 ml-2 opacity-90 hover:opacity-100 transition-opacity">
              <Logo variant="landing" size="lg" />
            </a>
            <p className="text-slate-400 text-[13px] text-center leading-relaxed max-w-[240px]">
              The refined platform for professional financial clarity and growth.
            </p>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-8">
              Platform
            </h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-emerald-500 transition-colors text-[13px]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-8">
              Resources
            </h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-emerald-500 transition-colors text-[13px]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-full lg:col-span-4 lg:pl-12">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-8">
              Stay Updated
            </h4>
            <div className="relative max-w-sm group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-4 pr-12 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer">
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Join 2,000+ others receiving our monthly finance optimization tips.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6 order-2 md:order-1">
            <p className="text-slate-400 text-[11px] tracking-tight">
              &copy; 2026 BudgetMe
            </p>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <Github size={16} />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-8 order-1 md:order-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-[10px] font-medium tracking-tight uppercase">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
