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

export const openIn2GIS = (latitude: number, longitude: number) => {
  const url = `https://2gis.kz/almaty/geo/${longitude},${latitude}`;
  window.open(url, "_blank");
};
