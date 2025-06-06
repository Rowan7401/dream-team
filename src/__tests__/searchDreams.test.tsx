/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SearchDreams from "@/pages/searchDreams";

// Mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useParams: () => ({ uid: "test-uid" }),
}));

// Mock firebase/firestore functions
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn((db, name) => ({ __name: name })),
    query: jest.fn((collectionRef, ...filters) => ({
      __collection__: collectionRef.__name,
      __filters__: filters,
    })),
    getDocs: jest.fn((q) => {
      // Mock returning sample docs
      const mockDocs = [
        {
          id: "dream1",
          data: () => ({
            title: "Best Moles",
            pick1: "Whack-a-mole",
            pick2: "Guacamole",
            pick3: "Mole from Wind in the Willows",
            category: "Other",
            categoryLower: "other",
            createdByUsername: "testuser",
            cosignedBy: ["user1", "user2"]
          }),
        },
        {
          id: "dream2",
          data: () => ({
            title: "Best Rats",
            pick1: "Molerat",
            pick2: "Muskrat",
            pick3: "Ratboy",
            category: "Other",
            categoryLower: "other",
            createdByUsername: "testuser2",
            cosignedBy: ["user1"]
          }),
        },
      ];
      return Promise.resolve({ docs: mockDocs });
    }),
  };
});

jest.mock("@/lib/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "test-uid" },
  },
  db: {},
}));


// Mock child components
jest.mock("@/components/navbar", () => () => <div>Navbar Component</div>);
jest.mock("@/components/backButton", () => () => <button>BackButton</button>);

describe("SearchDreams", () => {
  it("shows loading state when categories are clicked", async () => {
    render(<SearchDreams />);
    const mostPopularButton = screen.getByRole("button", { name: /most popular/i });
    fireEvent.click(mostPopularButton);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await screen.findByText(/Best Rats/i);
  });


  it("shows created by username and co-signed usernames when result cards popup", async () => {
    render(<SearchDreams />);

    expect(screen.getByText("Search Dream Teams")).toBeInTheDocument();

    const otherButton = screen.getByRole("button", { name: /other/i });
    fireEvent.click(otherButton);

    expect(await screen.findByText(/Best Moles/i)).toBeInTheDocument();
    const createdBys = await screen.findAllByText(/Created By:/i);
    expect(createdBys.length).toBeGreaterThan(0);

    const testUsers = await screen.findAllByText(/testuser/i);
    expect(testUsers.length).toBeGreaterThan(0);
    const coSigns = await screen.findAllByText(/\*\*\*co-signed by:/i)
    expect(testUsers.length).toBeGreaterThan(0);
    await screen.findByText(/user1, user2/i);

  });

  it("shows loading state when search bar is clicked", async () => {
    render(<SearchDreams />);
    fireEvent.change(screen.getByPlaceholderText(/Search for a dream team by title.../i), {
      target: { value: "best moles" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for final UI state to avoid act warning
    await screen.findByText(/Best Moles/i);
  });


  it("shows error when search input is empty", async () => {
    render(<SearchDreams />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(await screen.findByText(/Please type a valid Dream Team title/i)).toBeInTheDocument();
  });

  it("shows dream team results from Firestore mock", async () => {
    render(<SearchDreams />);

    fireEvent.change(screen.getByPlaceholderText(/Search for a dream team by title.../i), {
      target: { value: "best" },
    });

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(await screen.findByText(/Best Moles/i)).toBeInTheDocument();
    expect(screen.getByText(/Whack-a-mole/i)).toBeInTheDocument();
    expect(await screen.findByText(/Best Rats/i)).toBeInTheDocument();
    expect(screen.getByText(/Muskrat/i)).toBeInTheDocument();

  });

});
