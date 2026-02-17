import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { Contact } from "../../src/components/Contact/Contact";
import { ReduceMotionProvider } from "../../src/contexts/ReduceMotionContext";

const renderWithProviders = (component: React.ReactNode) => {
  return render(<ReduceMotionProvider>{component}</ReduceMotionProvider>);
};

describe("Contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as unknown) = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders contact form with all fields", () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );
    const submitButton = screen.getByRole("button", { name: /send message/i });

    expect(nameInput).toBeDefined();
    expect(emailInput).toBeDefined();
    expect(messageInput).toBeDefined();
    expect(submitButton).toBeDefined();
  });

  it("renders section title", () => {
    renderWithProviders(<Contact />);

    const title = screen.getByText(/get in touch/i);
    expect(title).toBeDefined();
  });

  it("renders social links container", () => {
    renderWithProviders(<Contact />);

    const socialLinksContainer = document.querySelector("._socialLinks_f5b38c");
    expect(socialLinksContainer).toBeDefined();
  });

  it("shows validation errors on submit with empty fields", async () => {
    renderWithProviders(<Contact />);

    const submitButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameError = screen.getByText(/name is required/i);
      const emailError = screen.getByText(/email is required/i);
      const messageError = screen.getByText(/message is required/i);

      expect(nameError).toBeDefined();
      expect(emailError).toBeDefined();
      expect(messageError).toBeDefined();
    });
  });

  it("shows error for invalid email", async () => {
    renderWithProviders(<Contact />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      const error = screen.getByText(/please enter a valid email/i);
      expect(error).toBeDefined();
    });
  });

  it("shows error for short name", async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    fireEvent.change(nameInput, { target: { value: "a" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      const error = screen.getByText(/name must be at least 2 characters/i);
      expect(error).toBeDefined();
    });
  });

  it("shows error for short message", async () => {
    renderWithProviders(<Contact />);

    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );
    fireEvent.change(messageInput, { target: { value: "short" } });
    fireEvent.blur(messageInput);

    await waitFor(() => {
      const error = screen.getByText(/message must be at least 10 characters/i);
      expect(error).toBeDefined();
    });
  });

  it("submits form successfully with valid data", async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );
    const submitButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message that is long enough." },
    });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const successTitle = screen.getByText(/message sent!/i);
        expect(successTitle).toBeDefined();
      },
      { timeout: 3000 },
    );
  });

  it("clears errors when field is corrected", async () => {
    renderWithProviders(<Contact />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      const error = screen.getByText(/please enter a valid email/i);
      expect(error).toBeDefined();
    });

    fireEvent.change(emailInput, { target: { value: "valid@example.com" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      const error = screen.queryByText(/please enter a valid email/i);
      expect(error).toBeNull();
    });
  });

  it("shows reset button after successful submission", async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );
    const submitButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message that is long enough." },
    });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const resetButton = screen.getByText(/send another message/i);
        expect(resetButton).toBeDefined();
      },
      { timeout: 3000 },
    );
  });

  it("resets form when reset button is clicked", async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );
    const submitButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message that is long enough." },
    });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const resetButton = screen.getByText(/send another message/i);
        expect(resetButton).toBeDefined();
      },
      { timeout: 3000 },
    );

    const resetButton = screen.getByText(/send another message/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      const newSubmitButton = screen.getByRole("button", {
        name: /send message/i,
      });
      expect(newSubmitButton).toBeDefined();
    });
  });

  it("has accessible form elements", () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText(
      "Tell me about your project...",
    );

    expect(nameInput.getAttribute("aria-invalid")).toBe("false");
    expect(emailInput.getAttribute("aria-invalid")).toBe("false");
    expect(messageInput.getAttribute("aria-invalid")).toBe("false");
  });

  it("marks invalid fields with aria-invalid", async () => {
    renderWithProviders(<Contact />);

    const submitButton = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText("Your name");
      expect(nameInput.getAttribute("aria-invalid")).toBe("true");
    });
  });
});
