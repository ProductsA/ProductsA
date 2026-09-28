import { Phone, Mail, MapPin, Heart } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  siteName: string;
  settings: Record<string, string>;
  adminEmail?: string | null;
  adminPhone?: string | null;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-5.58-2.78V2h5.58v4.69z"/>
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
};

const socialColors: Record<string, { hover: string; glow: string }> = {
  facebook: { hover: "hover:text-blue-500", glow: "hover:shadow-blue-500/40" },
  instagram: { hover: "hover:text-pink-500", glow: "hover:shadow-pink-500/40" },
  tiktok: { hover: "hover:text-foreground", glow: "hover:shadow-foreground/20" },
  youtube: { hover: "hover:text-red-500", glow: "hover:shadow-red-500/40" },
};

export function Footer({ siteName, settings, adminEmail, adminPhone }: FooterProps) {
  const phone = adminPhone || settings.phone || "";
  const email = adminEmail || settings.email || "";
  const address = settings.address || "";
  const facebook = settings.social_facebook || "";
  const instagram = settings.social_instagram || "";
  const tiktok = settings.social_tiktok || "";
  const youtube = settings.social_youtube || "";
  const description = settings.website_description || "";
  const footerText = settings.footer_text || "";

  const socialLinks = [
    { url: facebook, key: "facebook", label: "Facebook" },
    { url: instagram, key: "instagram", label: "Instagram" },
    { url: tiktok, key: "tiktok", label: "TikTok" },
    { url: youtube, key: "youtube", label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-card text-muted-foreground mt-auto border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-xl mb-4 text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">{siteName.charAt(0).toUpperCase()}</span>
                </div>
                <span>{siteName}</span>
              </Link>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
                  {description}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = socialIcons[social.key];
                    const colors = socialColors[social.key];
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg ${colors?.hover || ""} ${colors?.glow || ""}`}
                        title={social.label}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs font-bold">{social.label.charAt(0)}</span>}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
                Navigation
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                    Produits
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                    Recherche
                  </Link>
                </li>
                <li>
                  <Link href="/help/how-to-order" className="text-muted-foreground hover:text-foreground transition-colors">
                    Aide
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
                Contact
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {phone && (
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    {phone}
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    {email}
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted shrink-0 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
                Aide
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/help/how-to-order" className="hover:text-foreground transition-colors">
                    Comment commander ?
                  </Link>
                </li>
                <li>
                  <Link href="/help/choose-product" className="hover:text-foreground transition-colors">
                    Choisissez un produit
                  </Link>
                </li>
                <li>
                  <Link href="/help/fill-form" className="hover:text-foreground transition-colors">
                    Remplissez le formulaire
                  </Link>
                </li>
                <li>
                  <Link href="/help/receive-order" className="hover:text-foreground transition-colors">
                    Recevez votre commande
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {siteName}. Tous droits reserves.
            </p>
            <p className="flex items-center gap-1.5">
              Fait avec <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> au Maroc
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
