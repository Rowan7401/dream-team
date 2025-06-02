/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DreamTeamLanding from "@/pages/dreamTeamLanding";

// Define push mock so we can assert against it later
const push = jest.fn();

// Properly mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ uid: "test-uid" })),
  useRouter: () => ({ push }), // provide mock push
  usePathname: () => "/currentDreams",
}));

// Mock firebase auth
jest.mock("@/lib/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "test-uid" },
  },
  db: {},
}));

// Mock navbar
jest.mock("@/components/navbar", () => () => <div>Navbar Component</div>);

describe("DreamTeamLanding Component", () => {
  beforeEach(() => {
    push.mockClear(); // reset push between tests
  });

  it("renders landing navigation buttons", () => {
    render(<DreamTeamLanding />);

    expect(screen.getByText(/Search Dream Teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Create New Dream Team/i)).toBeInTheDocument();
    expect(screen.getByText(/View Current Dream Teams/i)).toBeInTheDocument();
  });

  it("navigates to /searchDreams on button click", async () => {
    render(<DreamTeamLanding />);
    const btn = screen.getByRole("button", { name: /Search Dream Teams/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/searchDreams");
    });
  });

  it("navigates to /searchUsers on button click", async () => {
    render(<DreamTeamLanding />);
    const btn = screen.getByRole("button", { name: /Search Users/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/searchUsers");
    });
  });

  it("navigates to /createNewDream on button click", async () => {
    render(<DreamTeamLanding />);
    const btn = screen.getByRole("button", { name: /Create New Dream Team/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/createNewDream");
    });
  });

  it("navigates to /currentDreams on button click", async () => {
    render(<DreamTeamLanding />);
    const btn = screen.getByRole("button", { name: /View Current Dream Teams/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/currentDreams");
    });
  });
});
