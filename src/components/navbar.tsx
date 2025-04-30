"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // <-- assuming you have this
import { FiUser } from "react-icons/fi";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);

  const navLinks = [
    { href: "/dreamTeamLanding", label: "Home" },
    { href: "/createNewDream", label: "Create Dream" },
    { href: "/searchDreams", label: "Search Dreams" },
    { href: "/searchUsers", label: "Search Users" },
    { href: "/currentDreams", label: "My Dreams" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

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

      <div className={styles.profileWrapper}>
        <FiUser 
          className={styles.profileIcon} 
          onClick={() => setOpenMenu(!openMenu)} 
        />
        {openMenu && (
          <div className={styles.dropdown}>
            <button onClick={handleProfile}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
