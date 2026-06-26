import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    path: "M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.5 5.5 0 0 0 12 7.5zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5zM18 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M13.5 21v-7h2.4l.4-2.8h-2.8V9.5c0-.8.2-1.3 1.4-1.3h1.5V5.7c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.8H8v2.8h2.5V21h3z",
  },
  {
    label: "X",
    href: "#",
    path: "M4 3h4.2l4 5.4L16.6 3H20l-6.3 7.7L20.4 21H16l-4.4-5.9L6.6 21H3l6.8-8.3z",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gf-border-soft bg-gf-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="tine-divider" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </span>
              <span className="font-display text-lg text-gf-cream">The Golden Fork</span>
            </div>
            <p className="text-sm text-gf-muted max-w-xs leading-relaxed">
              A modern dining room where seasonal menus, real-time ordering, and
              attentive service meet — online and at the table.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-full border border-gf-border text-gf-muted hover:border-gf-gold hover:text-gf-gold transition-colors"
                  aria-label={social.label}
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gf-gold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gf-muted">
              <li><Link href="/menu" className="hover:text-gf-gold transition-colors">Full Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-gf-gold transition-colors">Reservations</Link></li>
              <li><Link href="/account/orders" className="hover:text-gf-gold transition-colors">Order History</Link></li>
              <li><Link href="/register" className="hover:text-gf-gold transition-colors">Create Account</Link></li>
              <li><Link href="/#contact" className="hover:text-gf-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gf-gold mb-4">
              Visit
            </h4>
            <ul className="space-y-2.5 text-sm text-gf-muted">
              <li>124 Luxury Avenue, Culinary District</li>
              <li>Tue – Sun: 5:30 PM – 10:30 PM</li>
              <li>reservations@thegoldenfork.com</li>
              <li>+1 (212) 555-0199</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gf-border-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gf-muted-2">
            © {new Date().getFullYear()} The Golden Fork. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gf-muted-2">
            <Link href="#" className="hover:text-gf-gold">Privacy Policy</Link>
            <Link href="#" className="hover:text-gf-gold">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}