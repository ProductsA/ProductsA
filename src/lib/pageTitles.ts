import { prisma } from "./prisma";

const DEFAULT_SITE_NAME = "Souq";

export async function getSiteName(): Promise<string> {
  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: "website_name" },
    });
    return setting?.value || DEFAULT_SITE_NAME;
  } catch {
    return DEFAULT_SITE_NAME;
  }
}

export function siteTitle(siteName: string, pageName: string): string {
  if (!pageName) return siteName;
  return `${siteName} | ${pageName}`;
}
