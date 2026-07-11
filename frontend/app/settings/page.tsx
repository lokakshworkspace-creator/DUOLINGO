"use client";
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { updateSettings } from '@/lib/api';
import { Settings } from '@/lib/types';

export default function SettingsPage() {
  const { user, updateLocalUser } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  // If user or settings are null, fallback to true/defaults for UI
  const soundEnabled = user?.settings?.sound_enabled ?? true;
  const darkMode = user?.settings?.dark_mode ?? false;
  const notificationsEnabled = user?.settings?.notifications_enabled ?? true;

  const handleToggle = async (key: keyof Settings, currentValue: boolean | number) => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      const updatedSettings = await updateSettings({ [key]: !currentValue });
      updateLocalUser({
        settings: {
          ...(user.settings as Settings),
          ...updatedSettings
        }
      });
    } catch (e) {
      console.error('Failed to update setting', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggles = [
    { 
      id: 'sound_enabled',
      label: 'Sound effects', 
      desc: 'Play sounds and speech during exercises', 
      on: soundEnabled,
      action: () => handleToggle('sound_enabled', soundEnabled)
    },
    { 
      id: 'notifications_enabled',
      label: 'Notifications', 
      desc: 'Receive reminders and updates', 
      on: notificationsEnabled,
      action: () => handleToggle('notifications_enabled', notificationsEnabled)
    }
  ];

  if (!user) return null; // or loading spinner

  return (
    <div className="flex-1 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
      <h1 className="font-extrabold text-white text-3xl mb-8">Settings</h1>
      <div className={`duo-card divide-y divide-duo-border overflow-hidden ${isUpdating ? 'opacity-50 pointer-events-none' : 'transition-opacity'}`}>
        {toggles.map(t => (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <div className="font-extrabold text-white">{t.label}</div>
              <div className="text-duo-text-muted text-sm">{t.desc}</div>
            </div>
            <div 
              onClick={t.action}
              className={`w-14 h-8 rounded-full relative transition-colors cursor-pointer ${t.on ? 'bg-duo-green' : 'bg-duo-border'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow transition-transform ${t.on ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
