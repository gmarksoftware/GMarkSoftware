import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const SiteContext = createContext({ settings: {}, ready: false });

/** Loads impact numbers / contact / donation / social settings from the NestJS API once. */
export function SiteProvider({ children }) {
  const [state, setState] = useState({ settings: {}, ready: false });
  useEffect(() => {
    api.get('/settings')
      .then((settings) => setState({ settings, ready: true }))
      .catch(() => setState({ settings: {}, ready: true })); // site still renders if the API is down
  }, []);
  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}
export const useSite = () => useContext(SiteContext);
