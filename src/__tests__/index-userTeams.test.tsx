/**
 * @jest-environment jsdom
 */

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

jest.mock("@/lib/firebaseConfig", () => ({
    auth: {
        currentUser: { uid: "test-uid" },
    },
    db: {},
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserTeamsPage from "@/pages/userTeams/[username]/index";
import * as firestore from "firebase/firestore";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/userTeams/testuser",
    route: "/userTeams/[username]",
    query: { username: "testuser" },
    asPath: "/userTeams/testuser",
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isReady: true,
    basePath: "",
  }),
}));

// Mock navbar
jest.mock("@/components/navbar", () => () => <div>Navbar Component</div>);

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

// Mock Firestore functions
jest.mock("firebase/firestore", () => {
    const original = jest.requireActual("firebase/firestore");

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
                (f: any) => f._field === "createdByUsername" && f._value === "testuser"
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

describe("UserTeamsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders loading initially", () => {
        render(<UserTeamsPage />);
        expect(screen.getByText(/loading dream teams for testuser/i)).toBeInTheDocument();
    });

    it("renders message when no teams found", async () => {
        // Override getDocs to return no teams
        (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] }); // created
        (firestore.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] }); // cosigned

        render(<UserTeamsPage />);

        expect(await screen.findByText(/testuser has no dream teams yet/i)).toBeInTheDocument();
    
    });

    it("renders created teams", async () => {
        render(<UserTeamsPage />);

       
        expect(await screen.findByText(/Dream Teams by testuser/i)).toBeInTheDocument();
        expect(await screen.findByText(/🛠 created by testuser/i)).toBeInTheDocument();
        expect(await screen.findByText("My Created Dream Team")).toBeInTheDocument();
        expect(await screen.findByText("Pick A")).toBeInTheDocument();
        expect(await screen.findByText("Pick B")).toBeInTheDocument();
        expect(await screen.findByText("Pick C")).toBeInTheDocument();
        expect(await screen.findByText("Movies")).toBeInTheDocument();
        expect(await screen.findByText(/Co-signed by:/i)).toBeInTheDocument();
    


    });

    it("renders co-signed teams", async () => {
        render(<UserTeamsPage />);

        expect(await screen.findByText(/🤝 Co-signed by testuser/i)).toBeInTheDocument();
        expect(await screen.findByText("My Cosigned Dream Team")).toBeInTheDocument();
        expect(await screen.findByText("Pick X")).toBeInTheDocument();
        expect(await screen.findByText("Pick Y")).toBeInTheDocument();
        expect(await screen.findByText("Pick Z")).toBeInTheDocument();
        expect(await screen.findByText("Food")).toBeInTheDocument();
        expect(await screen.findByText(/Co-signed by:/i)).toBeInTheDocument();
    


    });
});
