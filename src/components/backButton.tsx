"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/BackButton.module.css"; // We'll create this next

export default function BackButton() {
  const router = useRouter();

  return (
    <button className={styles.backButton} onClick={() => router.back()}>
      ← Back
    </button>
  );
}
