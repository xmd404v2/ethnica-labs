"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyAuthProviderProps {
  children: ReactNode;
}

export function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  if (!appId) {
    console.error("Missing Privy App ID");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'apple', 'twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#6366F1', // Indigo color from your theme
          logo: 'https://your-ethnica-logo-url.png', // Add your logo URL here
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
} 