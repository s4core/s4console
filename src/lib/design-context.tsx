'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DesignContextValue {
  isOldDesign: boolean;
  isLoaded: boolean;
}

const DesignContext = createContext<DesignContextValue>({
  isOldDesign: false,
  isLoaded: false,
});

export function useDesign() {
  return useContext(DesignContext);
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [isOldDesign, setIsOldDesign] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/design')
      .then((res) => res.json())
      .then((data: { designOld: boolean }) => {
        setIsOldDesign(data.designOld);
        if (data.designOld) {
          document.documentElement.setAttribute('data-design-old', '');
        } else {
          document.documentElement.removeAttribute('data-design-old');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <DesignContext.Provider value={{ isOldDesign, isLoaded }}>
      {children}
    </DesignContext.Provider>
  );
}
