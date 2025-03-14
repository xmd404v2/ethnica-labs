import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const isValidPrivyAppId = privyAppId && privyAppId !== "your-privy-app-id";

  // Only wrap with Privy if there's a valid app ID
  if (isValidPrivyAppId) {
    return (
      <PrivyProvider
        appId={privyAppId as string}
        // ...other config
      >
        {children}
      </PrivyProvider>
    );
  }
  
  // Otherwise, just return the children without Privy
  return <>{children}</>;
} 