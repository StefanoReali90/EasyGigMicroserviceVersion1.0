const BASE_URL_PROFILE = "http://localhost:8081";
const BASE_URL_BOOKING = "http://localhost:8082";

export const api = {
  users: {
    list: () => fetch(`${BASE_URL_PROFILE}/users/`).then(res => res.json()),
    get: (id) => fetch(`${BASE_URL_PROFILE}/users/${id}`).then(res => res.json()),
  },
  bands: {
    list: () => fetch(`${BASE_URL_PROFILE}/bands`).then(res => res.json()),
  },
  venues: {
    list: () => fetch(`${BASE_URL_PROFILE}/venues`).then(res => res.json()),
  },
  slots: {
    getCalendar: (venueId, month, year) => 
      fetch(`${BASE_URL_BOOKING}/slots/calendar/${venueId}?month=${month}&year=${year}`).then(res => res.json()),
    create: (data) => fetch(`${BASE_URL_BOOKING}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  },
  bookings: {
    create: (userId, data) => fetch(`${BASE_URL_BOOKING}/bookings`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Id": userId
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  }
};
