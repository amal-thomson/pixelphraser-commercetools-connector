import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSelectedLanguages } from '../hooks/fetchSelectedLanguages';

const SelectedLanguagesContext = createContext<any | null>(null);

export const SelectedLanguagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLanguages, setSelectedLanguages] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const result = await fetchSelectedLanguages((action: any) => action);
        setSelectedLanguages(result.value);
      } catch (error) {
        console.error('Failed to fetch selected languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  return (
    <SelectedLanguagesContext.Provider value={selectedLanguages}>
      {children}
    </SelectedLanguagesContext.Provider>
  );
};

export const useSelectedLanguages = () => useContext(SelectedLanguagesContext);
