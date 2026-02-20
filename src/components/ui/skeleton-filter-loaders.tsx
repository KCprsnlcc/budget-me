"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Table skeleton loader for filter changes
export function FilterTableSkeleton({ rows = 10, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <Skeleton width={80} height={12} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <Skeleton width={j === 0 ? 120 : 80} height={16} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SkeletonTheme>
  );
}

// Grid skeleton loader for filter changes
export function FilterGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} borderRadius={8} />
                <div>
                  <Skeleton width={120} height={16} className="mb-1" />
                  <Skeleton width={80} height={10} />
                </div>
              </div>
              <Skeleton width={60} height={20} borderRadius={10} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton width={40} height={12} />
                <Skeleton width={100} height={12} />
              </div>
              <Skeleton height={8} borderRadius={4} />
              <div className="flex justify-between">
                <Skeleton width={80} height={10} />
                <Skeleton width={30} height={10} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
              <Skeleton width={32} height={32} borderRadius={4} />
              <Skeleton width={32} height={32} borderRadius={4} />
              <Skeleton width={32} height={32} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Transaction-specific grid skeleton (same as FilterGridSkeleton but named for clarity)
export function TransactionFilterGridSkeleton({ items = 6 }: { items?: number }) {
  return <FilterGridSkeleton items={items} />;
}

// Budget-specific grid skeleton (same as FilterGridSkeleton but named for clarity)
export function BudgetFilterGridSkeleton({ items = 6 }: { items?: number }) {
  return <FilterGridSkeleton items={items} />;
}

// Goal-specific grid skeleton (different layout for goals)
export function GoalFilterGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} borderRadius={8} />
                <div>
                  <Skeleton width={120} height={16} className="mb-1" />
                  <div className="flex items-center gap-2 mt-0.5">
                    <Skeleton width={60} height={16} borderRadius={8} />
                    <Skeleton width={40} height={16} borderRadius={8} />
                  </div>
                </div>
              </div>
              <Skeleton width={80} height={20} borderRadius={10} />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton width={40} height={12} />
                <Skeleton width={100} height={12} />
              </div>
              <Skeleton height={8} borderRadius={4} />
              <div className="flex justify-between">
                <Skeleton width={80} height={10} />
                <Skeleton width={30} height={10} />
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={24} borderRadius={4} />
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
              <Skeleton width={32} height={32} borderRadius={4} />
              <Skeleton width={32} height={32} borderRadius={4} />
              <Skeleton width={32} height={32} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}
