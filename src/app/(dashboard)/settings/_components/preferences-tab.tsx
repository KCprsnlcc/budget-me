"use client";

import { useState, useEffect } from "react";
import { PhilippinePeso, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "./constants";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function PreferencesTab() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="p-6 space-y-8 animate-in fade-in duration-300">
          {}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} borderRadius={8} />
                <div>
                  <Skeleton width={140} height={14} className="mb-1" />
                  <Skeleton width={60} height={10} />
                </div>
              </div>
              <Skeleton width={50} height={20} borderRadius={12} />
            </div>
            <Skeleton height={60} borderRadius={8} />
          </div>

          {}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Skeleton width={40} height={40} borderRadius={8} />
              <div className="flex-1">
                <Skeleton width={150} height={14} className="mb-2" />
                <Skeleton count={2} height={11} className="mb-1" />
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-600">
              <PhilippinePeso size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Philippine Peso</h3>
              <p className="text-[10px] text-gray-500">₱ PHP</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700">
            Fixed
          </span>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-gray-500">
            Currency is standardized to PHP for all users to ensure consistency.
          </span>
        </div>
      </div>

      {}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">About Data Privacy</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Your settings are automatically saved. We prioritize your data privacy and security. 
          All financial data is encrypted and stored securely. We never share your personal information 
          with third parties without your explicit consent. You have full control over your data and can 
          export or delete it at any time.
        </p>
      </div>
    </div>
  );
}
