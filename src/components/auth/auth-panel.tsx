import { Logo } from "@/components/shared/logo";

interface AuthPanelProps {
  children: React.ReactNode;
}

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <>
      {/* Left Panel: Auth Form */}
      <div className="flex w-full shrink-0 flex-col border-r border-slate-100 bg-white sm:w-[400px] lg:w-[450px] relative z-20 h-screen">
        {/* Header: Logo */}
        <div className="shrink-0 px-8 pt-6 pb-2 bg-white z-10">
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 scroll-smooth">
          <div className="flex min-h-full flex-col items-center py-10">
            <div className="w-full max-w-[300px] my-auto">{children}</div>
          </div>
        </div>
      </div>

      {/* Right Panel: Decorative */}
      <div className="hidden sm:flex flex-1 items-center justify-center bg-slate-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 text-center max-w-md px-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <div className="w-6 h-6 rounded-full bg-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Financial Clarity Starts Here
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Track expenses, set goals, and grow your wealth with intelligent budgeting tools.
          </p>
        </div>
      </div>
    </>
  );
}
