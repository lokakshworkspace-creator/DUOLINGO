"use client";
import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '@/lib/api';
import { Settings } from '@/lib/types';
import { toast } from '@/components/ui/Toast';

export default function MorePage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error);
  }, []);

  const handleToggle = async (key: keyof Settings) => {
    if (!settings) return;
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });
    try {
      await updateSettings({ [key]: newVal });
      toast.success('Settings updated');
    } catch (e: any) {
      toast.error('Failed to update settings');
      setSettings({ ...settings, [key]: !newVal }); // revert
    }
  };

  return (
    <div className="flex-1 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
      <h1 className="font-extrabold text-white text-3xl mb-8">Settings</h1>
      
      {settings ? (
        <div className="duo-card divide-y divide-duo-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔊</span>
              <div>
                <div className="font-extrabold text-white">Sound Effects</div>
                <div className="text-duo-text-muted text-sm">Play sounds during lessons</div>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('sound_enabled')}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.sound_enabled ? 'bg-duo-green' : 'bg-duo-bg'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.sound_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔔</span>
              <div>
                <div className="font-extrabold text-white">Notifications</div>
                <div className="text-duo-text-muted text-sm">Receive reminders</div>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('notifications_enabled')}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.notifications_enabled ? 'bg-duo-green' : 'bg-duo-bg'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-duo-text-muted font-bold">Loading settings...</div>
      )}
    </div>
  );
}
