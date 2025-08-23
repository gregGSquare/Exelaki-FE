import React, { createContext, useContext, useEffect, useState } from "react";

interface AppError {
  id: string;
  message: string;
  detail?: string;
}

interface ErrorContextValue {
  pushError: (err: { message: string; detail?: string }) => void;
  clearError: (id?: string) => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const useErrorV2 = (): ErrorContextValue => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useErrorV2 must be used within ErrorProviderV2");
  return ctx;
};

export const ErrorProviderV2: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const pushError = (e: { message: string; detail?: string }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setErrors(prev => [...prev, { id, message: e.message, detail: e.detail }]);
  };

  const clearError = (id?: string) => {
    if (!id) setErrors([]); else setErrors(prev => prev.filter(x => x.id !== id));
  };

  // Global listener example (optional hook-in point)
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      pushError({ message: event.message });
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  return (
    <ErrorContext.Provider value={{ pushError, clearError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1100] space-y-2 w-[22rem]">
        {errors.map(err => (
          <div key={err.id} className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 shadow">
            <div className="flex justify-between items-start">
              <div className="pr-2">
                <div className="font-medium">{err.message}</div>
                {err.detail && <div className="text-xs text-red-700 mt-1">{err.detail}</div>}
              </div>
              <button className="text-red-700/80 hover:text-red-900" onClick={() => clearError(err.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ErrorContext.Provider>
  );
};


