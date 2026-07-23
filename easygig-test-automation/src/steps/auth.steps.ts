import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request } from '@playwright/test';
import { ApiHelper } from '../utils/apiHelper.js';

export let lastResponse: any = null;
export let lastResponseBody: any = null;

export function setLastResponse(res: any, body: any) {
  lastResponse = res;
  lastResponseBody = body;
}

When('invio una richiesta POST a {string} con email {string} e password {string}', async function (path: string, email: string, pass: string) {
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  const res = await reqContext.post(path, {
    data: { email, password: pass },
  });
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  setLastResponse(res, body);
});

Then('la risposta HTTP ha codice di stato {int}', async function (statusCode: number) {
  expect(lastResponse.status()).toBe(statusCode);
});

Then('la risposta contiene un campo {string} valido', async function (fieldName: string) {
  expect(lastResponseBody[fieldName]).toBeTruthy();
});

Then('il ruolo dell\'utente è {string}', async function (roleName: string) {
  const role = lastResponseBody.user ? lastResponseBody.user.role : lastResponseBody.role;
  expect(role).toBe(roleName);
});

Given('che sono autenticato nel sistema', async function () {
  const auth = await ApiHelper.getAuthToken();
  expect(auth.token).toBeTruthy();
});

When('richiedo il profilo utente per l\'ID {int}', async function (userId: number) {
  const { token } = await ApiHelper.getAuthToken();
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  const res = await reqContext.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  setLastResponse(res, body);
});

Then('l\'email del profilo corrisponde a {string}', async function (expectedEmail: string) {
  expect(lastResponseBody.email).toBe(expectedEmail);
});
