import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request } from '@playwright/test';
import { ApiHelper } from '../utils/apiHelper.js';
import { setLastResponse, lastResponseBody } from './auth.steps.js';

let createdSlotId: number | null = null;
let currentTestDateStr: string = '';

When('creo uno slot per il locale {int} per la data {string} dalle {string} alle {string}', async function (venueId: number, dateStr: string, startTime: string, endTime: string) {
  const { token } = await ApiHelper.getAuthToken();
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  
  // Per garantire l'isolamento del test, genera una data unica basata sul timestamp corrente
  const uniqueDate = new Date(Date.now() + Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0];
  currentTestDateStr = uniqueDate;

  const startIso = `${uniqueDate}T${startTime}:00`;
  const endIso = `${uniqueDate}T${endTime}:00`;

  const res = await reqContext.post('/slots', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      venueId,
      start: startIso,
      end: endIso,
    },
  });

  let body: any;
  try {
    body = await res.json();
    if (body.id) {
      createdSlotId = body.id;
    }
  } catch {
    body = await res.text();
  }
  setLastResponse(res, body);
});

When('tento di creare uno slot sovrapposto per la data {string} dalle {string} alle {string}', async function (originalDateStr: string, startTime: string, endTime: string) {
  const { token } = await ApiHelper.getAuthToken();
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  
  // Utilizza la stessa data dinamica generata nello step precedente dello scenario
  const dateStr = currentTestDateStr || originalDateStr;
  const startIso = `${dateStr}T${startTime}:00`;
  const endIso = `${dateStr}T${endTime}:00`;

  const res = await reqContext.post('/slots', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      venueId: 1,
      start: startIso,
      end: endIso,
    },
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  setLastResponse(res, body);
});

Then('lo slot appena creato viene eliminato con successo con risposta {int}', async function (expectedCode: number) {
  if (!createdSlotId) return;
  const { token } = await ApiHelper.getAuthToken();
  const reqContext = await request.newContext({ baseURL: 'http://localhost:8080' });
  const deleteRes = await reqContext.delete(`/slots/${createdSlotId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(deleteRes.status()).toBe(expectedCode);
});

Then('la risposta contiene il messaggio {string}', async function (partialMessage: string) {
  const msg = typeof lastResponseBody === 'string' ? lastResponseBody : lastResponseBody.message;
  expect(msg).toContain(partialMessage);
});
