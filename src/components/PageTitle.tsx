"use client";

import { useEffect, useState } from "react";

const DEFAULT_SITE_NAME = "Souq";

export function PageTitle({ pageName }: { pageName: string }) {
  const [siteName, setSiteName] = useState(DEFAULT_SITE_NAME);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const name = data.website_name || DEFAULT_SITE_NAME;
        setSiteName(name);
        document.title = pageName ? `${name} | ${pageName}` : name;
      })
      .catch(() => {
        document.title = pageName ? `${DEFAULT_SITE_NAME} | ${pageName}` : DEFAULT_SITE_NAME;
      });
  }, [pageName]);

  useEffect(() => {
    document.title = pageName ? `${siteName} | ${pageName}` : siteName;
  }, [pageName, siteName]);

  return null;
}
