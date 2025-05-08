import { render, screen } from '@testing-library/react';
import NavBar from '../Frontend/src/components/NavBar';

test('renders logo & dashboard link', () => {
  render(<NavBar />);
  expect(screen.getByText(/ai coaching/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/Home');
});
