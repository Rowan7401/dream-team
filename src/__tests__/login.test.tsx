jest.mock('@/lib/firebaseConfig');

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/index"; // Make sure this points to your Login page
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import '@testing-library/jest-dom';

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));


describe("LoginPage", () => {

  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  it("shows error on blank email or password", async () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    expect(await screen.findByText(/email and password fields cannot be blank/i)).toBeInTheDocument();

  });

  it("shows error on invalid credentials", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error("Invalid login"));

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "person@email.com / username" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

   const loginButton = screen.getByRole("button", { name: /log in/i });
   fireEvent.click(loginButton);

    await waitFor(() =>
      expect(screen.getByText(/invalid login/i)).toBeInTheDocument()
    );
  });

  it("redirects on successful login", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "person@email.com / username" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

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
