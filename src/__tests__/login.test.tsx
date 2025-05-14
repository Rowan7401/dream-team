jest.mock('@/lib/firebaseConfig');

import { getDocs } from "firebase/firestore";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/index";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import '@testing-library/jest-dom';

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

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
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ email: "person@email.com" }) }],
    });

    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error("Invalid login"));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com \/ gary/i), {
      target: { value: "username" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });

    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.includes("Incorrect Username and/or Password")
        )
      ).toBeInTheDocument();
    });

  });

  // beforeEach(() => {
  //   jest.useFakeTimers(); // Enable fake timers
  //   (useRouter as jest.Mock).mockReturnValue({ push });
  //   jest.clearAllMocks();
  // });

  // afterEach(() => {
  //   jest.useRealTimers(); // Restore real timers after each test
  // });

  // it("shows and clears error after 5 seconds", async () => {
  //   render(<LoginPage />);

  //   // Trigger error condition
  //   fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com/i), {
  //     target: { value: "wronguser@example.com" },
  //   });

  //   fireEvent.change(screen.getByPlaceholderText(/password123/i), {
  //     target: { value: "wrongpassword" },
  //   });

  //   const loginButton = screen.getByRole("button", { name: /log in/i });
  //   fireEvent.click(loginButton);

  //   // Check that error message appears
  //   expect(await screen.findByText(/invalid login/i)).toBeInTheDocument();

  //   // Fast forward 5 seconds (5000 ms)
  //   jest.advanceTimersByTime(5000);

  //   // Check if the error message has been cleared
  //   expect(screen.queryByText(/invalid login/i)).not.toBeInTheDocument();
  // });


  it("shows error if username is not found", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/garywinthorpe@example.com \/ gary/i), {
      target: { value: "username" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password123/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    screen.debug(); // TEMP: View what's rendered

    await waitFor(() =>
      expect(screen.getByText("Username not found")).toBeInTheDocument()
    );
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
