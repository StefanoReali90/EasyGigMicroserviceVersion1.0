import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request } from '@playwright/test';
import { ApiHelper } from '../utils/apiHelper.js';

let bookingResponse: any = null;
let bookingResponseBody: any = null;

When('richiedo le prenotazioni per l\'utente con ID {int}', async function (userId: number) {
  const { token } = await ApiHelper.getAuthToken();
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  bookingResponse = await reqContext.get(`/bookings/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  bookingResponseBody = await bookingResponse.json();
});

Then('la lista delle prenotazioni non è nulla', async function () {
  expect(Array.isArray(bookingResponseBody)).toBe(true);
});
