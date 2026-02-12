import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Flag,
  Wand2,
  BarChart3,
  MessageCircle,
  Users,
  Settings,
  Search,
  TrendingUp,
  Brain,
  FileText,
  Sparkles,
  Shield,
  Sliders,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_CARDS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Flag,
  Wand2,
  BarChart3,
  MessageCircle,
  Users,
  Settings,
  Search,
  TrendingUp,
  Brain,
  FileText,
  Sparkles,
  Shield,
  Sliders,
};

export function ModulesShowcase() {
  return (
    <section id="modules" className="relative z-10 py-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase mb-3">
            Interface
          </h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            The Dashboard Experience
          </h3>
          <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Explore the modular architecture built for sophisticated financial planning.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline">View all modules</Button>
            <Button variant="outline">
              <Play size={16} />
              Interactive demo
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULE_CARDS.map((card) => {
            const PrimaryIcon = ICON_MAP[card.icon];
            const SecondaryIcon = card.secondaryIcon
              ? ICON_MAP[card.secondaryIcon]
              : null;

            return (
              <div
                key={card.title}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                {/* Icon Preview */}
                <div className="h-40 bg-slate-50 flex items-center justify-center p-8">
                  <div className="flex items-center gap-4">
                    {PrimaryIcon && (
                      <PrimaryIcon size={48} className="text-slate-300" strokeWidth={1.5} />
                    )}
                    {SecondaryIcon && (
                      <SecondaryIcon size={36} className="text-slate-400" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-[17px] font-bold text-slate-900 mb-2">
                    {card.title}
                  </h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <a
                    href="#"
                    className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5 hover:gap-2 transition-all cursor-pointer"
                  >
                    View Module{" "}
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </a>

                  {/* Tech Ticker */}
                  <div className="mt-6 pt-4 border-t border-slate-50 overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="flex animate-marquee gap-8 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Browser Native &bull; Works on all devices</span>
                      <span className="text-emerald-500">&bull;</span>
                      <span>Secure Encryption &bull; Bank-level security</span>
                      <span className="text-emerald-500">&bull;</span>
                      <span>Browser Native &bull; Works on all devices</span>
                      <span className="text-emerald-500">&bull;</span>
                      <span>Secure Encryption &bull; Bank-level security</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
