"use client";

import { useState } from "react";
import LogoUpload from "@/components/ui/LogoUpload";

export default function DashboardProfile({
  logoUrl,
  companyName,
}: {
  logoUrl: string | null;
  companyName: string;
}) {
  const [currentLogo, setCurrentLogo] = useState(logoUrl);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Company Profile</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="text-xs text-[#1F4E79] font-medium hover:underline"
        >
          {showUpload ? "Close" : currentLogo ? "Edit Logo" : "Add Logo"}
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
          {currentLogo ? (
            <img src={currentLogo} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-gray-300">
              {companyName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{companyName}</p>
          {!currentLogo && (
            <p className="text-xs text-gray-400 mt-0.5">Add a logo to appear on your job listings</p>
          )}
        </div>
      </div>
      {showUpload && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <LogoUpload
            currentLogoUrl={currentLogo}
            onUploadComplete={(url) => {
              setCurrentLogo(url);
              setShowUpload(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
