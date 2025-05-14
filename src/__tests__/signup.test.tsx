beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");
  return {
    ...original,
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(), // <-- so you can mock it per test
    doc: jest.fn(),
    setDoc: jest.fn(),
  };
});


const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/firebaseConfig');

import { getDocs } from "firebase/firestore";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "@/pages/signup";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import '@testing-library/jest-dom';

describe("Signup", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  it("shows error on blank email or password", async () => {
    render(<Signup />);

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username, email, and password fields cannot be blank/i)).toBeInTheDocument();
    });
  });

  it("shows error on invalid signup", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error("Username can only contain lowercase letters, numbers, !, &, $, _, or -.")
    );
    (getDocs as jest.Mock).mockResolvedValue({ empty: true }); // allow signup to proceed

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "usernam%%e" },
    });

    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com/i), {
      target: { value: "you@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Username can only contain lowercase letters,/i)).toBeInTheDocument();
  });

  it("shows error if username is already taken", async () => {
    render(<Signup />);

    (getDocs as jest.Mock).mockResolvedValue({ empty: false, });

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "schlinger" },
    });

    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com/i), {
      target: { value: "rowdiggity7401@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
    });
  });

  it("redirects on successful signup", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { username: "dawgs", email: "you@example.com", password: "password123" }
    });

    render(<Signup />);

    (getDocs as jest.Mock).mockResolvedValue({ empty: true }); // allow signup to proceed

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "schlinger" },
    });

    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com/i), {
      target: { value: "rowdiggity7401@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dreamTeamLanding");
    });
  });

  it("has a working login link", () => {
    render(<Signup />);
    const logInLink = screen.getByRole("link", { name: /log in/i });
    expect(logInLink).toHaveAttribute("href", "/");
  });
});
