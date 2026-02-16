import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Contact } from '../../src/components/Contact/Contact';
import { ReduceMotionProvider } from '../../src/contexts/ReduceMotionContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(<ReduceMotionProvider>{component}</ReduceMotionProvider>);
};

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form with all fields', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders section title', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  it('renders social links', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows validation errors on submit with empty fields', async () => {
    renderWithProviders(<Contact />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email', async () => {
    renderWithProviders(<Contact />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('shows error for short name', async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'a' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows error for short message', async () => {
    renderWithProviders(<Contact />);

    const messageInput = screen.getByLabelText(/message/i);
    fireEvent.change(messageInput, { target: { value: 'short' } });
    fireEvent.blur(messageInput);

    await waitFor(() => {
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('clears errors when field is corrected', async () => {
    renderWithProviders(<Contact />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('shows reset button after successful submission', async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/send another message/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('resets form when reset button is clicked', async () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButton = screen.getByText(/send another message/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });
  });

  it('has accessible form elements', () => {
    renderWithProviders(<Contact />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(messageInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('marks invalid fields with aria-invalid', async () => {
    renderWithProviders(<Contact />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
