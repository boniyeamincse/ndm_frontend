import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  darkMode: localStorage.getItem('ndm-dark-mode') === 'true',
  mobileMenuOpen: false,
  currentPage: 'Home',
  isLoading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_DARK_MODE':
      const newDarkMode = !state.darkMode;
      localStorage.setItem('ndm-dark-mode', newDarkMode);
      return { ...state, darkMode: newDarkMode };
    case 'SET_MOBILE_MENU':
      return { ...state, mobileMenuOpen: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
