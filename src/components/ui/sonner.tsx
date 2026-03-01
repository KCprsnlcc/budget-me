"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-700 group-[.toaster]:border-slate-100 group-[.toaster]:shadow-sm",
          description: "group-[.toast]:text-slate-400 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-slate-700 group-[.toast]:border group-[.toast]:border-slate-200 group-[.toast]:hover:bg-slate-50",
          cancelButton:
            "group-[.toast]:bg-white group-[.toast]:text-slate-500 group-[.toast]:hover:bg-slate-50",
          success: "group-[.toast]:text-emerald-600",
          error: "group-[.toast]:text-red-600",
          warning: "group-[.toast]:text-amber-600",
          info: "group-[.toast]:text-slate-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
