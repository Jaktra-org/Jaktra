import { api, authEvents } from '../../src/services/api';
import axios from 'axios';

describe('API interceptors', () => {
  let requestInterceptor: any;
  let responseErrorInterceptor: any;

  beforeAll(() => {
    requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('injects Authorization header when valid token is in localStorage', async () => {
    const farFutureExp = Math.floor(Date.now() / 1000) + 200000;
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ id: '1', exp: farFutureExp }));
    const token = `${header}.${payload}.signature`;
    localStorage.setItem('auth_token', token);

    const config = { headers: {} } as any;
    const processedConfig = await requestInterceptor(config);

    expect(processedConfig.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('attempts to refresh token and updates storage when token expires in less than 24 hours', async () => {
    const nearFutureExp = Math.floor(Date.now() / 1000) + 10000; // < 24 hours
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ id: '1', exp: nearFutureExp }));
    const token = `${header}.${payload}.signature`;
    localStorage.setItem('auth_token', token);

    // Mock the refresh API request
    const mockPost = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { token: 'refreshed-token-xyz' },
    });

    const config = { headers: {} } as any;
    const processedConfig = await requestInterceptor(config);

    expect(mockPost).toHaveBeenCalled();
    expect(localStorage.getItem('auth_token')).toBe('refreshed-token-xyz');
    expect(processedConfig.headers.Authorization).toBe('Bearer refreshed-token-xyz');

    mockPost.mockRestore();
  });

  it('clears token and dispatches unauthorized event on 401 response status unless MFA endpoint', async () => {
    const mockToken = 'dummy-token';
    localStorage.setItem('auth_token', mockToken);

    const unauthorizedEventSpy = vi.fn();
    authEvents.addEventListener('unauthorized', unauthorizedEventSpy);

    const error = {
      response: { status: 401 },
      config: { url: '/settings' },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(unauthorizedEventSpy).toHaveBeenCalled();
  });

  it('does not clear token on 401 status from MFA validation endpoints', async () => {
    const mockToken = 'dummy-token';
    localStorage.setItem('auth_token', mockToken);

    const unauthorizedEventSpy = vi.fn();
    authEvents.addEventListener('unauthorized', unauthorizedEventSpy);

    const error = {
      response: { status: 401 },
      config: { url: '/auth/mfa/confirm' },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

    // Token should NOT be cleared and event should NOT be fired
    expect(localStorage.getItem('auth_token')).toBe(mockToken);
    expect(unauthorizedEventSpy).not.toHaveBeenCalled();
  });
});
