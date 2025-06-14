import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useRemoveAllQueries = () => {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    if (pathname) {
      router.replace(pathname, { scroll: false });
    }
  }, [router, pathname]);
};

export const removeAllQueriesFromUrl = () => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  }
};
