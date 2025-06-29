/**
 * Example of how to set up the PushScreenProvider in your app root
 * This should be added to your main layout or app component
 */

import { PushScreenProvider } from "@/shared/contexts";
import { ReactNode } from "react";

// Example 1: In your main layout file (app/layout.tsx)
export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PushScreenProvider>
          {/* Your existing providers */}
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </PushScreenProvider>
      </body>
    </html>
  );
}

// Example 2: In a specific page or section
export function AppSection({ children }: { children: ReactNode }) {
  return (
    <PushScreenProvider>
      <div className="app-section">{children}</div>
    </PushScreenProvider>
  );
}

// Example 3: Combining with other contexts
export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserStoreProvider>
        <PushScreenProvider>
          <DeliveryPointProvider>
            <PhotoUploadProvider>{children}</PhotoUploadProvider>
          </DeliveryPointProvider>
        </PushScreenProvider>
      </UserStoreProvider>
    </AuthProvider>
  );
}

// Placeholder providers for the example
function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function UserStoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function DeliveryPointProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function PhotoUploadProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
