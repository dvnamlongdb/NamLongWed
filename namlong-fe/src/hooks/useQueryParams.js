/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import { isNotEmpty } from "@mantine/form";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useQueryParams(keys) {
  const searchParams = useSearchParams(); // ✅ Get search params
  const pathname = usePathname(); // ✅ Get current path
  const router = useRouter(); // ✅ Next.js router

  const [paramsObject, setParamsObject] = useState(() => {
    const initialParams = {};
    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) initialParams[key] = value;
    });
    return initialParams;
  });

  // ✅ Only update when `searchParams` actually change
  useEffect(() => {
    const newParams = {};
    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        newParams[key] = value;
      }
    });

    // ✅ Prevent unnecessary state updates to avoid infinite loop
    if (JSON.stringify(paramsObject) !== JSON.stringify(newParams)) {
      setParamsObject(newParams);
    }
  }, [searchParams.toString() , keys?.join(",")]);

  // ✅ Update multiple query params at once
  const updateParam = (newParams) => {
    if (!newParams || typeof newParams !== 'object') return;
    
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key); // ✅ Remove empty params
      } else {
        params.set(key, String(value)); // ✅ Update param
      }
    });

    router.push(`${pathname}?${params.toString()}`); // ✅ Redirect with new query params
  };

  return [isNotEmpty(paramsObject) ? paramsObject : {}, updateParam];
}
