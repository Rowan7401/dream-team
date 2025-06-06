import { render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '@/pages/profile';
import { auth, db } from '@/lib/firebaseConfig';
import { useRouter, usePathname } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));


jest.mock('@/lib/firebaseConfig', () => ({
  auth: {
    currentUser: { uid: '123' },
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('ProfilePage', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue('/profile');
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays user data when user is authenticated and Firestore returns data', async () => {
    // Mock Firestore
    (doc as jest.Mock).mockReturnValue('mockDocRef');
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        email: 'test@example.com',
        username: 'testuser',
        uid: '123',
      }),
    });

    render(<ProfilePage />);

    // Wait for async data loading and state update
     expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Username:')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('User ID:')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  it('shows "No user data found." if Firestore doc does not exist', async () => {
    (auth as any).currentUser = { uid: '456' };
    (doc as jest.Mock).mockReturnValue('mockDocRef');
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('No user data found.')).toBeInTheDocument();
      expect(screen.getByText('Please signup or login again to authenticate your account access.')).toBeInTheDocument();
    });
  });
});
