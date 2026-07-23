import { request, APIRequestContext } from '@playwright/test';

export class ApiHelper {
  private static token: string | null = null;
  private static userId: number | null = null;

  static async getAuthToken(): Promise<{ token: string; userId: number }> {
    if (this.token && this.userId) {
      return { token: this.token, userId: this.userId };
    }

    const context = await request.newContext({ baseURL: 'http://localhost:8080' });
    const response = await context.post('/auth/login', {
      data: {
        email: 'stefanoreali.whs@gmail.com',
        password: 'Killer90231',
      },
    });

    if (!response.ok()) {
      throw new Error(`Login fallito durante i test automation: ${response.status()} ${await response.text()}`);
    }

    const body = await response.json();
    this.token = body.token;
    this.userId = body.user.id;
    return { token: this.token!, userId: this.userId! };
  }

  static async getAuthenticatedContext(): Promise<APIRequestContext> {
    const { token } = await this.getAuthToken();
    return await request.newContext({
      baseURL: 'http://localhost:8080',
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
