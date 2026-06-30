import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renders the label text', () => {
    render(<PrimaryButton label="Submit" />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<PrimaryButton label="Click me" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<PrimaryButton label="Disabled" disabled />);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('is disabled when loading prop is true', () => {
    render(<PrimaryButton label="Save" loading />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<PrimaryButton label="Save" onClick={onClick} disabled />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as a submit button when type="submit"', () => {
    render(<PrimaryButton label="Send" type="submit" />);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });

  it('defaults to type="button"', () => {
    render(<PrimaryButton label="Default" />);
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('type', 'button');
  });

  it('renders a spinner aria-hidden element when loading', () => {
    const { container } = render(<PrimaryButton label="Saving" loading />);
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });
});
