/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, act, screen } from "@testing-library/react";
import CurrentDreams from "@/pages/currentDreams";

// Mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useParams: () => ({ uid: "test-uid" }),
}));

// Mock firebase/firestore functions
jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");

  const mockCreatedDoc = {
    id: "created-id",
    data: () => ({
      title: "My Created Dream Team",
      pick1: "Pick A",
      pick2: "Pick B",
      pick3: "Pick C",
      category: "Movies",
      createdByUsername: "testuser",
      uid: "test-uid",
    }),
  };

  const mockCosignedDoc = {
    id: "cosigned-id",
    data: () => ({
      title: "My Cosigned Dream Team",
      pick1: "Pick X",
      pick2: "Pick Y",
      pick3: "Pick Z",
      category: "Food",
      createdByUsername: "otheruser",
      uid: "other-uid",
      cosignedBy: ["testuser"],
    }),
  };

  return {
    ...original,
    doc: jest.fn(() => "mockDocRef"),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ username: "testuser" }),
      })
    ),
    collection: jest.fn(() => "mockCollection"),
    where: jest.fn((field, op, value) => ({ _field: field, _op: op, _value: value })),
    query: jest.fn((collectionRef, ...filters) => ({ __filters__: filters })),
    getDocs: jest.fn((queryObj) => {
      const filters = queryObj?.__filters__ || [];

      const isCreatedQuery = filters.some(
        (f: any) => f._field === "uid" && f._value === "test-uid"
      );
      const isCosignedQuery = filters.some(
        (f: any) => f._field === "cosignedBy" && f._value === "testuser"
      );

      if (isCreatedQuery) return Promise.resolve({ docs: [mockCreatedDoc] });
      if (isCosignedQuery) return Promise.resolve({ docs: [mockCosignedDoc] });

      return Promise.resolve({ docs: [] });
    }),
  };
});

// Mock auth
jest.mock("@/lib/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "test-uid" },
  },
  db: {},
}));

// Mock child components
jest.mock("@/components/navbar", () => () => <div>Navbar Component</div>);
jest.mock("@/components/backButton", () => () => <button>BackButton</button>);

describe("CurrentDreams Component", () => {

  it("displays the username in the header", async () => {
    await act(async () => {   
      render(<CurrentDreams />);
    });

    const heading = await screen.findByText(/testuser's Dream Teams/i);
    expect(heading).toBeInTheDocument();
  });


  it("renders created dream teams", async () => {
    await act(async () => {
      render(<CurrentDreams />);
    });


    expect(await screen.findByText(/🛠 Created by You/i)).toBeInTheDocument();
    expect(screen.getByText("Pick A")).toBeInTheDocument();
    expect(screen.getByText("Pick B")).toBeInTheDocument();
    expect(screen.getByText("Movies")).toBeInTheDocument();
  });

  it("renders cosigned dream teams", async () => {
    await act(async () => {
      render(<CurrentDreams />);
    });


    expect(await screen.findByText(/🤝 Co-signed by You/i)).toBeInTheDocument();
    expect(screen.getByText("Pick X")).toBeInTheDocument();
    expect(screen.getByText("Pick Y")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Created By:")).toBeInTheDocument();
    expect(screen.getByText("otheruser")).toBeInTheDocument();
    expect(screen.getByText("\*\*\*Co-signed by:")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });
});
