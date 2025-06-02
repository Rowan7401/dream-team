/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/index";
import { getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import "@testing-library/jest-dom";

// ✅ Mock router push function
const push = jest.fn();

// ✅ Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ uid: "test-uid" })),
  useRouter: () => ({ push }),
  usePathname: jest.fn(() => "/"),
}));

// ✅ Mock firebase/auth
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// ✅ Mock firebase/firestore
jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");
  return {
    ...original,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
  };
});

// ✅ Mock firebaseConfig
jest.mock("@/lib/firebaseConfig", () => ({
  auth: {
    currentUser: { uid: "test-uid" },
  },
  db: {},
}));

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows error on blank email or password", async () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    expect(await screen.findByText(/email and password fields cannot be blank/i)).toBeInTheDocument();
  });

  it("shows error on invalid credentials", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ email: "person@email.com" }) }],
    });

    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error("Invalid login"));

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com \/ gary/i), {
      target: { value: "person@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Incorrect Username and\/or Password/i)).toBeInTheDocument();
    });
  });

  it("shows error if username is not found", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com \/ gary/i), {
      target: { value: "unknownuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Username not found")).toBeInTheDocument();
    });
  });

  it("redirects on successful login", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ email: "person@email.com" }) }],
    });

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com \/ gary/i), {
      target: { value: "person@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dreamTeamLanding");
    });
  });

  it("has a working signup link", () => {
    render(<LoginPage />);
    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });
});
