"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dreamTeamLanding", label: "Home" },
    { href: "/createNewDream", label: "Create Dream" },
    { href: "/searchDreams", label: "Search Dreams" },
    { href: "/searchUsers", label: "Search Users" },
    { href: "/currentDreams", label: "My Dreams" },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${
              pathname === link.href ? styles.active : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
