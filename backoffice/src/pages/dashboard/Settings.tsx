import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { settingsApi } from '../../api/settings';
import { SETTINGS_GROUPS, SETTING_TYPES } from '../../config/settingsConfig';
import Swal from 'sweetalert2';
import { Save, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

// Interface matching backend
interface Setting {
  key: string;
  value: string;
  group: string;
  label?: string;
  type?: string;
  description?: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('GENERAL');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Main form for editing values
  const { register, handleSubmit, setValue } = useForm();
  
  // "Add New" form
  const { 
    register: registerNew, 
    handleSubmit: handleSubmitNew, 
    reset: resetNew,
    // formState: { errors } 
  } = useForm({ mode: 'onChange' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
      
      // Populate main form
      data.forEach(setting => {
        setValue(setting.key, setting.value);
      });
      
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: Record<string, string>) => {
    try {
      setIsSaving(true);
      
      // Update our local state values with form data to create payload
      const payload = settings.map(s => ({
        ...s,
        value: data[s.key] // Get updated value from form
      }));

      await settingsApi.updateSettings(payload);
      
      // Update local state to reflect saved
      setSettings(payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Settings updated successfully',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const onAddNew = async (data: any) => {
    try {
      // Validate key format (simple check)
      const key = data.key.toUpperCase().replace(/\s+/g, '_');
      
      // Check duplicate
      if (settings.find(s => s.key === key)) {
        Swal.fire({ icon: 'error', title: 'Duplicate Key', text: 'This setting key already exists.' });
        return;
      }

      const newSetting = {
        key,
        label: data.label,
        value: data.value,
        type: data.type,
        group: data.group,
        description: data.description
      };

      // We can just add it to the list and save strictly via updateSettings api
      // OR explicitly create it. Since updateSettings uses upsert, we can use it.
      const payload = [...settings, newSetting];
      
      await settingsApi.updateSettings(payload);
      
      setSettings(payload);
      setValue(newSetting.key, newSetting.value); // Add to form
      
      setShowAddModal(false);
      resetNew();
      
      Swal.fire({
        icon: 'success',
        title: 'Added',
        text: 'New setting added successfully',
        timer: 1500,
        showConfirmButton: false,
      });
      
    } catch (error) {
       console.error('Failed to add setting:', error);
       Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add setting' });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  const activeGroup = SETTINGS_GROUPS.find(g => g.id === activeTab) || SETTINGS_GROUPS[0];
  const ActiveIcon = activeGroup.icon;
  
  // Filter settings for current tab
  const groupSettings = settings.filter(s => s.group === activeTab);

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 mt-1">Manage global configuration dynamically.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Setting</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
            {SETTINGS_GROUPS.map((config) => {
              const Icon = config.icon;
              const isActive = activeTab === config.id;
              return (
                <button
                  key={config.id}
                  onClick={() => setActiveTab(config.id)}
                  className={clsx(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                    isActive 
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-6">
               <div className="p-3 bg-brand-primary/10 rounded-xl">
                   <ActiveIcon className="w-6 h-6 text-brand-primary" />
               </div>
               <div>
                   <h2 className="text-lg font-bold text-gray-900">{activeGroup.label} Settings</h2>
                   <p className="text-sm text-gray-500">{activeGroup.description}</p>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {groupSettings.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                   No settings configured for this group yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {groupSettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {setting.label || setting.key} <span className="text-xs font-normal text-gray-400 ml-2">({setting.key})</span>
                      </label>
                      
                      {/* Render input based on type */}
                      {setting.type === 'textarea' ? (
                        <textarea
                          {...register(setting.key)}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                          placeholder={setting.description || `Enter ${setting.label}`}
                        />
                      ) : setting.type === 'boolean' ? (
                         <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                {...register(setting.key)} 
                                className="sr-only peer" 
                                // Booleans need special handling if stored as 'true'/'false' strings
                                // For simplicity, we assume text storage 'true'/'false' for now or handle conversion
                              />
                               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                            </label>
                            <span className="text-sm text-gray-500">Enable/Disable</span>
                         </div>
                      ) : (
                        <input
                          type={setting.type || 'text'}
                          {...register(setting.key)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                          placeholder={setting.description || `Enter ${setting.label}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add New Setting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900">Add New Setting</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmitNew(onAddNew)} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group</label>
                    <select 
                      {...registerNew('group', { required: true })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-brand-primary"
                    >
                      {SETTINGS_GROUPS.map(g => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                    <select 
                      {...registerNew('type', { required: true })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-brand-primary"
                    >
                      {SETTING_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key</label>
                    <input 
                      type="text" 
                      {...registerNew('key', { required: true })}
                      placeholder="e.g. FACEBOOK_URL" 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-brand-primary"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Label</label>
                    <input 
                      type="text" 
                      {...registerNew('label', { required: true })}
                      placeholder="e.g. Facebook Page URL" 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-brand-primary"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Default Value</label>
                    <input 
                      type="text" 
                      {...registerNew('value')}
                      placeholder="Enter value..." 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-brand-primary"
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-primary-dark transition-colors mt-4 shadow-lg shadow-brand-primary/20"
                 >
                    Create Setting
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
