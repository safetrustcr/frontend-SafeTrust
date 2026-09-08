import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HotelHeader from './HotelHeader';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe('HotelHeader rent navigation', () => {
  it('exposes all rent destinations and closes after selection', () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole('button', { name: 'Rent' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: /browse all units/i })).toHaveAttribute('href', '/rent');
    expect(screen.getByRole('menuitem', { name: /^suggestions/i })).toHaveAttribute('href', '/guest/suggestions');
    expect(screen.getByRole('menuitem', { name: /my wishlist/i })).toHaveAttribute('href', '/dashboard/favorites');

    fireEvent.click(screen.getByRole('menuitem', { name: /browse all units/i }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside click', () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole('button', { name: 'Rent' });
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the trigger', () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole('button', { name: 'Rent' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});
