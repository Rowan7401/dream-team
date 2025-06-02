/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Profile from "@/pages/profile";

// Define mock push to test redirection
const push = jest.fn();

// Mock Firebase Auth and DB
jest.mock("@/lib/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "test-uid" },
  },
  db: {},
}));

// Mock Firestore methods
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mockDocRef"),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        email: "test@email.com",
        username: "testuser",
        uid: "test-uid",
      }),
    })
  ),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Mock Navbar
jest.mock("@/components/navbar", () => () => <div>Navbar Component</div>);

describe("ProfilePage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders loading state initially", () => {
    render(<Profile />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders profile data after loading", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(/test@email.com/i)).toBeInTheDocument();

    expect(screen.getByText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();

    expect(screen.getByText(/User ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/test-uid/i)).toBeInTheDocument();
  });
});
