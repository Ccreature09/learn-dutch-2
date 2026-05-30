"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/generator", label: "Translation Drill", icon: "✍️" },
  { href: "/translation", label: "Translation", icon: "🔄" },
  { href: "/flashcards", label: "Flashcards", icon: "🃏" },
  { href: "/builder", label: "Sentence Builder", icon: "🧩" },
  { href: "/error-correction", label: "Error Correction", icon: "🔍" },
  { href: "/vocabulary", label: "Vocabulary", icon: "📖" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-flag">🇳🇱</span>
        <span className="navbar-title">Leer Nederlands</span>
      </div>
      <ul className="navbar-links">
        {NAV_LINKS.map(({ href, label, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={`navbar-link ${pathname === href ? "navbar-link--active" : ""}`}
            >
              <span className="navbar-link-icon">{icon}</span>
              <span className="navbar-link-label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
