"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NavigationLoadingContext = createContext<{
  isNavigating: boolean;
  startNavigation: () => void;
}>({
  isNavigating: false,
  startNavigation: () => {},
});

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating, startNavigation }}>
      {isNavigating && (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-[1000] h-1 overflow-hidden bg-emerald-100">
          <div className="h-full w-1/3 animate-[route-progress_1s_ease-in-out_infinite] rounded-r-full bg-emerald-500" />
        </div>
      )}
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export const useNavigationLoading = () => useContext(NavigationLoadingContext);
