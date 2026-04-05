import { test, expect } from '@playwright/test';

test.describe('API-тесты для Restful-booker', () => {

  const baseURL = 'https://restful-booker.herokuapp.com';

  const bookingData = {
    "firstname" : "Jim",
    "lastname" : "Brown",
    "totalprice" : 111,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2018-01-01",
        "checkout" : "2019-01-01"
    },
    "additionalneeds" : "Breakfast"
  };

  let id;
  let authToken;

  test('@api Создание бронирования', async ({ request }) => {
    const response = await request.post(`${baseURL}/booking`, {
        data: bookingData,
    });

    console.log(`Статус-код: ${response.status()}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Тело ответа:', responseBody);
    expect(responseBody.booking).toMatchObject(bookingData);
    expect(responseBody).toHaveProperty('bookingid');

    id = responseBody.bookingid;
  });

  test('@api Получение информации о бронировании', async ({ request }) => {
    const response = await request.get(`${baseURL}/booking/${id}`);

    console.log(`Статус-код: ${response.status()}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Тело ответа:', responseBody);
    expect(responseBody).toMatchObject(bookingData);
  });

  test('@api Обновление бронирования', async ({ request }) => {
    const authResponse = await request.post(`${baseURL}/auth`, {
        data: { "username": "admin", "password": "password123" }
    });
    const authBody = await authResponse.json();
    authToken = authBody.token;

    const newBookingData = {
      "firstname" : "John",
      "lastname" : "Brown",
      "totalprice" : 666,
      "depositpaid" : true,
      "bookingdates" : {
          "checkin" : "2018-01-01",
          "checkout" : "2019-01-01"
      },
      "additionalneeds" : "Breakfast"
    };

    const response = await request.put(`${baseURL}/booking/${id}`, {
        data: newBookingData,
        headers: { 'Cookie': `token=${authToken}` }
    });

    console.log(`Статус-код: ${response.status()}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Тело ответа:', responseBody);
    expect(responseBody).toMatchObject(newBookingData);
  });

  test('@api Удаление бронирования', async ({ request }) => {
    const response = await request.delete(`${baseURL}/booking/${id}`, {
        headers: { 'Cookie': `token=${authToken}` }
    });

    console.log(`Статус-код: ${response.status()}`);
    expect(response.status()).toBe(201);

    const addCheck = await request.get(`${baseURL}/booking/${id}`);
    console.log(`Статус-код: ${addCheck.status()}`);
    expect(addCheck.status()).toBe(404);
  });

});