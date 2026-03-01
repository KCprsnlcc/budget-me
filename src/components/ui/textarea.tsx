import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, error, ref, ...props }: TextareaProps) {
  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1.5 text-xs text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
