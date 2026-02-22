import { CheckCircle, Wand2 } from "lucide-react";
import { FEATURES } from "@/lib/constants";

export function Features() {
  return (
    <section id="features" className="relative z-10 py-16 px-6 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase mb-2">
            Capabilities
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
            Refined Financial Control
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Experience a suite of tools designed for precision, clarity, and ease of use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`group relative p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 ${
                feature.wide
                  ? "md:col-span-2 flex flex-col md:flex-row gap-6 items-start"
                  : ""
              }`}
            >
              <div className={feature.wide ? "flex-1" : ""}>
                <h4 className="text-[17px] font-bold text-slate-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {feature.wide ? (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {feature.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2 mb-6">
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[13px] text-slate-600"
                      >
                        <CheckCircle size={14} className="text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href="#"
                  className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5 hover:gap-2 transition-all cursor-pointer"
                >
                  {feature.wide ? "Explore AI Features" : "Learn more"}
                </a>
              </div>

              {/* AI Visual decoration */}
              {feature.wide && (
                <div className="w-full md:w-64 h-48 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=\")",
                    }}
                  />
                  <div className="text-center p-4 relative z-10 w-full">
                    <Wand2 size={36} className="text-emerald-500 mb-3 mx-auto" />
                    <div className="mt-2 h-1 w-24 bg-slate-200 rounded-full overflow-hidden mx-auto relative">
                      <div className="absolute inset-y-0 left-0 rounded-full animate-shimmer-flow w-[40%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
