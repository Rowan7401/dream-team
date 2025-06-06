import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getDoc, getDocs, collection, doc } from 'firebase/firestore';
import * as nextNavigation from "next/navigation";
import SearchUsers from "@/pages/searchUsers";
import '@testing-library/jest-dom';

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

beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});

jest.mock("next/navigation", () => ({
    ...jest.requireActual("next/navigation"),
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));


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

const push = jest.fn();

beforeEach(() => {
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push });
    (nextNavigation.usePathname as jest.Mock).mockReturnValue("/currentDreams");
    jest.clearAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks(); // reset mocks before each test

    // Mock next/router hooks
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push });
    (nextNavigation.usePathname as jest.Mock).mockReturnValue("/currentDreams");

    // Unified getDoc mock - for current user friends data
    (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
            username: "TestUser",
            friends: [
                {
                    uid: "friend-uid",
                    username: "frienduser",
                    email: "friend@example.com",
                },
                {
                    uid: "mule_uid",
                    username: "mule",
                    email: "mule@example.com",
                },
            ],
        }),
    });

    // Unified getDocs mock handles all Firestore queries dynamically
    (getDocs as jest.Mock).mockImplementation((queryObj) => {
        const filters = queryObj?.__filters__;

        // Case 1: No filters → user search
        if (!filters || filters.length === 0) {
            return Promise.resolve({
                docs: [
                    {
                        id: "rat_uid",
                        data: () => ({
                            uid: "rat_uid",
                            username: "rat",
                            email: "rat@example.com",
                        }),
                    },
                    {
                        id: "mule_uid",
                        data: () => ({
                            uid: "mule_uid",
                            username: "mule",
                            email: "mule@example.com",
                        }),
                    },
                    {
                        id: "friend_uid",
                        data: () => ({
                            uid: "friend_uid",
                            username: "jerry",
                            email: "jerry@example.com",
                        }),
                    },
                ],
            });
        }

        // Case 2: Authored teams
        const authoredUsername = filters.find(
            (f: any) => f._field === "createdByUsername"
        )?._value;

        if (authoredUsername === "rat") return Promise.resolve({ size: 2, docs: [] });
        if (authoredUsername === "mule") return Promise.resolve({ size: 1, docs: [] });
        if (authoredUsername === "jerry") return Promise.resolve({ size: 1, docs: [] });

        // Case 3: Cosigned teams
        const cosignedUsername = filters.find(
            (f: any) => f._field === "cosignedBy"
        )?._value;

        if (cosignedUsername === "rat") return Promise.resolve({ size: 3, docs: [] });
        if (cosignedUsername === "mule") return Promise.resolve({ size: 4, docs: [] });
        if (cosignedUsername === "jerry") return Promise.resolve({ size: 0, docs: [] });

        // Default fallback
        return Promise.resolve({ size: 0, docs: [] });
    });
});


beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "error").mockImplementation(() => { });
});

describe("SearchUsers", () => {
    beforeEach(() => {
        (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push });
        jest.clearAllMocks();
    });

    it("shows error on blank text input search click", async () => {
        render(<SearchUsers />);

        const searchUsersButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchUsersButton);

        await waitFor(() => {
            expect(screen.getByText(/Please type a valid Username or a partial Username./i)).toBeInTheDocument();
        });
    });

    it("shows no users found message on searching for non-existent username", async () => {
        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "rattt" },
        });

        const searchUsersButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchUsersButton);

        await waitFor(() => {
            expect(screen.getByText(/No users found with that username or partial username./i)).toBeInTheDocument();
        });
    });

    it("shows users found and cards on searching for existing username(s)", async () => {
        (getDocs as jest.Mock).mockResolvedValueOnce({
            docs: [
                {
                    id: "user-id",
                    data: () => ({
                        uid: "user-id",
                        username: "mule",
                        email: "mule@example.com",
                    }),
                },
            ],
        });

        // Second getDocs call is for team counts (authored/cosigned)
        (getDocs as jest.Mock).mockResolvedValueOnce({ size: 2, docs: [] }); // authored
        (getDocs as jest.Mock).mockResolvedValueOnce({ size: 3, docs: [] }); // cosigned

        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "mule" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        expect(await screen.findByText(/Search Results/i)).toBeInTheDocument();
        expect(await screen.findByText(/Username:/i)).toBeInTheDocument();
        expect(await screen.findByText(/mule/i)).toBeInTheDocument();
        expect(await screen.findByText(/Dream Teams Authored:/i)).toBeInTheDocument();
        expect(await screen.findByText(/Dream Teams Co-signed:/i)).toBeInTheDocument();
    });



    it("shows friends if user has friends", async () => {
        (getDoc as jest.Mock).mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                friends: [{ uid: "friend-uid", username: "frienduser", email: "friend@example.com" }],
            }),
        });

        (getDocs as jest.Mock).mockResolvedValue({
            size: 1,
            docs: [],
        });

        render(<SearchUsers />);

        fireEvent.click(screen.getByRole("button", { name: /view friends/i }));

        expect(await screen.findByText(/Your Friends/i)).toBeInTheDocument();
        expect(await screen.findByText(/Username:/i)).toBeInTheDocument();
        expect(await screen.findByText(/frienduser/i)).toBeInTheDocument();
        expect(await screen.findByText(/Dream Teams Authored:/i)).toBeInTheDocument();
        expect(await screen.findByText(/Dream Teams Co-signed:/i)).toBeInTheDocument();
    });


    it("shows no friends message if user has no friends", async () => {
        render(<SearchUsers />);

        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

        const viewFriendsButton = screen.getByRole("button", { name: /view friends/i });
        fireEvent.click(viewFriendsButton);

        await waitFor(() => {
            expect(screen.getByText(/Your Friends/i)).toBeInTheDocument();
            expect(screen.getByText(/You have no friends yet. /i)).toBeInTheDocument();
        });
    });

    it("alerts user if they already have friended a user", async () => {
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                username: "TestUser",
                friends: [
                    { uid: "mule_uid", username: "mule", email: "mule@example.com" }
                ],
            }),
        });

        const mockDocData = {
            uid: "mule_uid",
            username: "mule",
            email: "mule@example.com",
        };

        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "mockDocId",
                    data: () => mockDocData,
                },
            ],
        });

        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "mule" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /add friend/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /add friend/i }));

        await waitFor(() => {
            expect(screen.getByText(/This user is already your friend!/i)).toBeInTheDocument();

        });

    });

    it("alerts user if they successfully friend a user", async () => {
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                username: "TestUser",
                friends: [
                    { uid: "skunk_uid", username: "skunk", email: "skunk@example.com" }
                ],
            }),
        });

        const mockDocData = {
            uid: "rat_uid",
            username: "rat",
            email: "rat@example.com",
        };

        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "mockDocId",
                    data: () => mockDocData,
                },
            ],
        });

        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "rat" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /add friend/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /add friend/i }));

        await waitFor(() => {
            expect(screen.getByText(/rat has been added as a friend!/i)).toBeInTheDocument();

        });

    });

    it("cursed ahh test, ignore", async () => {

        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                username: "TestUser",
                friends: [
                    {
                        uid: "friend_uid",
                        username: "jerry",
                        email: "jerry@example.com"
                    }
                ],
            }),
        });

        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "jerry" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
        });

        // fireEvent.click(screen.getByRole("button", { name: /view dream teams/i }));

        // await waitFor(() => {
        //     expect(push).toHaveBeenCalledWith("/userTeams/jerry");
        // });
    });

    it("redirects to view dreams on clicking view dream teams button of searched for user", async () => {

        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                username: "TestUser",
                friends: [
                    {
                        uid: "friend_uid",
                        username: "jerry",
                        email: "jerry@example.com"
                    }
                ],
            }),
        });

        render(<SearchUsers />);

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: "jerry" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /view dream teams/i }));

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("/userTeams/jerry");
        });
    });

    it("redirects to view dreams on clicking friends view user's dream teams button", async () => {
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                username: "TestUser",
                friends: [
                    {
                        uid: "friend_uid",
                        username: "jerry",
                        email: "jerry@example.com"
                    }
                ],
            }),
        });

        render(<SearchUsers />);

        fireEvent.click(screen.getByRole("button", { name: /view friends/i }));

        await waitFor(() => {
            expect(screen.getByText(/Your Friends/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /view dream teams/i }));

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("/userTeams/jerry");
        });
    });


});
