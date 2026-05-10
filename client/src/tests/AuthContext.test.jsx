import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('TC-CTX-001: AuthContext provides user as null on fresh load', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('TC-CTX-002: login() sets user and token in state and localStorage', async () => {
    const mockUser = { id: '1', name: 'Test', role: 'user' };
    api.post.mockResolvedValueOnce({ data: { success: true, token: 'fake-token', user: mockUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('fake-token');
    expect(localStorage.getItem('melcho_token')).toBe('fake-token');
    expect(localStorage.getItem('melcho_user')).toBe(JSON.stringify(mockUser));
  });
});
