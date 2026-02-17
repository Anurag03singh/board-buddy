import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Auth from "../../pages/Auth";
import { supabase } from "../../integrations/supabase/client";

// Mock Supabase
vi.mock("../../integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("Auth Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form by default", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText("SYSTEM ACCESS")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /authenticate/i })
    ).toBeInTheDocument();
  });

  it("should toggle to signup form", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const toggleButton = screen.getByText("Create account");
    fireEvent.click(toggleButton);

    expect(screen.getByText("CREATE ACCOUNT")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
  });

  it("should handle successful login", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should handle signup", async () => {
    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Switch to signup
    fireEvent.click(screen.getByText("Create account"));

    const displayNameInput = screen.getByLabelText("Display Name");
    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /initialize/i });

    fireEvent.change(displayNameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: { display_name: "John Doe" },
          emailRedirectTo: expect.any(String),
        },
      });
    });
  });

  it("should validate required fields", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(passwordInput.minLength).toBe(6);
  });
});
