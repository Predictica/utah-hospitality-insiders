"use client";

import { useState, useEffect } from "react";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  useEffect(() => { fetchSettings(); }, []);

  function updateValue(key: string, value: string) {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settings.map((s) => ({ key: s.key, value: s.value })) }),
      });
      setSaved(true);
    } catch {
      // silently fail
    }
    setSaving(false);
  }

  function getSetting(key: string): Setting | undefined {
    return settings.find((s) => s.key === key);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  const toggleSettings = [
    "free_tier_job_limit_enabled",
    "require_approval_free_listings",
  ];

  const numberSettings = ["free_tier_job_limit"];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900 text-sm">{setting.key}</p>
              {setting.description && (
                <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
              )}
            </div>
            <div className="shrink-0">
              {toggleSettings.includes(setting.key) ? (
                <button
                  onClick={() => updateValue(setting.key, setting.value === "true" ? "false" : "true")}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    setting.value === "true" ? "bg-[#1F4E79]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      setting.value === "true" ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              ) : numberSettings.includes(setting.key) ? (
                <input
                  type="number"
                  min="1"
                  value={setting.value}
                  onChange={(e) => updateValue(setting.key, e.target.value)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 text-center"
                />
              ) : (
                <input
                  type="text"
                  value={setting.value}
                  onChange={(e) => updateValue(setting.key, e.target.value)}
                  className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#163a5c] transition-colors disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
