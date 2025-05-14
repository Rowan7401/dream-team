jest.mock("next/navigation", () => ({
    ...jest.requireActual("next/navigation"),
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock('@/lib/firebaseConfig');
jest.mock("firebase/auth", () => ({
    createNewDream: jest.fn(),
}));

jest.mock("firebase/firestore", () => {
    const original = jest.requireActual("firebase/firestore");
    return {
        ...original,
        query: jest.fn(),
        collection: jest.fn(),
        where: jest.fn(),
        getDocs: jest.fn(),
        getDoc: jest.fn(),
        doc: jest.fn(),
        setDoc: jest.fn(),
        updateDoc: jest.fn(),
        addDoc: jest.fn(),
    };
});

import { getDoc, addDoc, updateDoc, collection, doc } from "firebase/firestore";

jest.mock("@/lib/firebaseConfig", () => ({
    db: {},
    auth: {
        currentUser: {
            uid: "mockUserId"
        }
    }
}));

(collection as jest.Mock).mockReturnValue("mockCollection");
(doc as jest.Mock).mockReturnValue("mockDoc");

import * as nextNavigation from "next/navigation";
import { getDocs } from "firebase/firestore";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateDream from "@/pages/createNewDream";
import '@testing-library/jest-dom';

const push = jest.fn();

beforeEach(() => {
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push });
    (nextNavigation.usePathname as jest.Mock).mockReturnValue("/createNewDream");
    jest.clearAllMocks();
});

beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "error").mockImplementation(() => { });
});

describe("CreateDream", () => {
    beforeEach(() => {
        (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push });
        jest.clearAllMocks();
    });

    it("shows error on blank pick(s)", async () => {
        render(<CreateDream />);

        (getDocs as jest.Mock).mockResolvedValue({ empty: true });

        fireEvent.change(screen.getByPlaceholderText(/title/i), {
            target: { value: "Dream Title" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 1/i), {
            target: { value: "pick 1" },
        });

        const createTeamButton = screen.getByRole("button", { name: /create team/i });
        fireEvent.click(createTeamButton);

        await waitFor(() => {
            expect(screen.getByText(/There must be 3 picks. Please fill in blank field\(s\)/i)).toBeInTheDocument();
        });
    });

    it("shows error on blank title", async () => {
        render(<CreateDream />);

        fireEvent.change(screen.getByPlaceholderText(/pick 1/i), {
            target: { value: "pick 1" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 2/i), {
            target: { value: "pick 2" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 3/i), {
            target: { value: "pick 3" },
        });

        const createTeamButton = screen.getByRole("button", { name: /create team/i });
        fireEvent.click(createTeamButton);

        await waitFor(() => {
            expect(screen.getByText(/Blank Title. Please input a Title for your team/i)).toBeInTheDocument();
        });
    });

    it("shows error if picks are not unique", async () => {
        render(<CreateDream />);

        (getDocs as jest.Mock).mockResolvedValue({ empty: true });

        fireEvent.change(screen.getByPlaceholderText(/title/i), {
            target: { value: "Dream Title" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 1/i), {
            target: { value: "pick 1" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 2/i), {
            target: { value: "pick 1" },
        });

        fireEvent.change(screen.getByPlaceholderText(/pick 3/i), {
            target: { value: "pick 3" },
        });

        const createTeamButton = screen.getByRole("button", { name: /create team/i });
        fireEvent.click(createTeamButton);

        await waitFor(() => {
            expect(screen.getByText(/Duplicate picks found/i)).toBeInTheDocument();
        });
    });

    it("redirects on successful team creation", async () => {
        render(<CreateDream />);

        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ username: "TestUser" }),
        });
        (addDoc as jest.Mock).mockResolvedValue({}); // Mock doc creation

        fireEvent.change(screen.getByPlaceholderText(/title/i), {
            target: { value: "My Dream Team" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 1/i), {
            target: { value: "One" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 2/i), {
            target: { value: "Two" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 3/i), {
            target: { value: "Three" },
        });

        fireEvent.click(screen.getByRole("button", { name: /create team/i }));


        await waitFor(() => {
            expect(screen.getByText(/✅ Thank you, dream team created! 😴💭/i)).toBeInTheDocument();
            expect(push).toHaveBeenCalledWith("/currentDreams");
        });
    });

    it("redirects on successful team co-signing", async () => {
        render(<CreateDream />);

        // Simulate user document with username
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ username: "TestUser" }),
        });

        // Simulate that the team already exists
        const mockDocData = {
            pick1: "Rat",
            pick2: "Mole",
            pick3: "Muskrat",
            cosignedBy: [], // User hasn't signed yet
        };

        const mockDocRef = {
            id: "mockDocId",
            data: () => mockDocData,
        };

        (getDocs as jest.Mock).mockResolvedValue({
            docs: [mockDocRef], // simulate one matching doc
        });

        const mockUpdateDoc = jest.fn();
        (updateDoc as jest.Mock) = mockUpdateDoc;

        fireEvent.change(screen.getByPlaceholderText(/title/i), {
            target: { value: "Rodents" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 1/i), {
            target: { value: "Rat" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 2/i), {
            target: { value: "Mole" },
        });
        fireEvent.change(screen.getByPlaceholderText(/pick 3/i), {
            target: { value: "Muskrat" },
        });

        fireEvent.click(screen.getByRole("button", { name: /create team/i }));

        await waitFor(() => {
            expect(screen.getByText(/✅ Co-signed existing Dream Team! 👊/i)).toBeInTheDocument();
            expect(push).toHaveBeenCalledWith("/currentDreams");
        });
    });

});
