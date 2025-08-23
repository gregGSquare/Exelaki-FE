import React, { useMemo } from "react";
import AppShell from "../layout/AppShell";
import { LayoutProvider } from "../state/LayoutContext";
import { useTheme } from "../state/ThemeContext";
import Switch from "../components/Switch";
import { useAuth } from "../../contexts/AuthContext";
import { usePreferences } from "../state/PreferencesContext";
import { getCurrencyList } from "../../utils/currency";
import CurrencyPicker from "../components/CurrencyPicker";

const Settings: React.FC = () => {
  const { theme, toggle, set } = useTheme();
  const { user, auth0User } = useAuth();
  const { currencyCode, setCurrencyCode } = usePreferences();
  const currencies = useMemo(() => getCurrencyList(), []);

  return (
    <LayoutProvider>
      <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 dark:bg-neutral-900/80 dark:border-neutral-800">
          <h2 className="text-lg font-semibold mb-3">Profile</h2>
          <div className="flex items-center gap-4">
            {auth0User?.picture ? (
              <img src={auth0User.picture} alt={auth0User.name || 'User'} className="h-16 w-16 rounded-full" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                {(auth0User?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-base font-medium text-neutral-800 dark:text-neutral-100">{auth0User?.name || user?.email}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Account details managed via Auth</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 dark:bg-neutral-900/80 dark:border-neutral-800">
          <h2 className="text-lg font-semibold mb-3">Appearance</h2>
          <div className="flex items-center justify-between py-1">
            <div className="text-base font-medium">Dark Mode</div>
            <Switch checked={theme === 'dark'} onChange={(checked) => set(checked ? 'dark' : 'light')} />
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 dark:bg-neutral-900/80 dark:border-neutral-800">
          <h2 className="text-lg font-semibold mb-3">Preferences</h2>
          <div className="space-y-2">
            <label className="text-base font-medium" htmlFor="currency">Currency</label>
            <CurrencyPicker value={currencyCode} onChange={setCurrencyCode} />
          </div>
        </div>
      </div>
      </AppShell>
    </LayoutProvider>
  );
};

export default Settings;


