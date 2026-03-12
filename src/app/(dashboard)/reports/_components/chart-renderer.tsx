

interface ChartRendererProps {
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
  data: any[];
  colors: string[];
  renderPieDonut?: (data: any[], colors: string[]) => React.ReactNode;
  renderColumnBar?: (data: any[], colors: string[]) => React.ReactNode;
  renderLineArea?: (data: any[], colors: string[]) => React.ReactNode;
}

export const EMERALD_SHADES = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export function GridLines() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
      <div className="w-full h-px bg-slate-100/50" />
      <div className="w-full h-px bg-slate-100/50" />
      <div className="w-full h-px bg-slate-100/50" />
      <div className="w-full h-px bg-slate-100/50" />
      <div className="w-full h-px bg-slate-100/50" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { 
  icon: React.ComponentType<any>; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
        <Icon size={24} className="sm:w-8 sm:h-8 text-slate-300" />
      </div>
      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
        {description}
      </p>
    </div>
  );
}
