import { test, expect, request, APIRequestContext } from '@playwright/test';

test.describe('ReqRes API tests', () => {

    let apiContext: APIRequestContext;

    test.beforeAll(async () => {
        apiContext = await request.newContext({
            extraHTTPHeaders: {
                'x-api-key': 'reqres-free-v1',
            },
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('Login API should return 200 and token', async () => {
        const response = await apiContext.post('https://reqres.in/api/login', {
            data: {
                email: 'eve.holt@reqres.in',
                password: 'cityslicka',
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.token).toBeDefined();
        expect(typeof responseBody.token).toBe('string');
        expect(responseBody.token.length).toBeGreaterThan(0);
    });

    test('List users API should return 200 and users list', async () => {
        const response = await apiContext.get('https://reqres.in/api/users?page=2');
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.page).toBe(2);
    });

    test('Fetch Users API should return 200 and at least 6 users', async () => {
        const response = await apiContext.get('https://reqres.in/api/users?page=2');
        expect(response.status()).toBe(200);

        const responseBody = await response.json();

        expect(responseBody.data).toBeDefined();
        expect(Array.isArray(responseBody.data)).toBe(true);
        expect(responseBody.data.length).toBeGreaterThanOrEqual(6);
    });

    test('Create User should return 201 and response contains id and createdAt', async () => {
        const createPayload = {
            name: 'John Doe',
            job: 'QA Tester',
        };

        const response = await apiContext.post('https://reqres.in/api/users', {
            data: createPayload,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(response.status()).toBe(201);

        const responseBody = await response.json();

        expect(responseBody.id).toBeDefined();
        expect(typeof responseBody.id).toBe('string');
        expect(responseBody.createdAt).toBeDefined();
        expect(typeof responseBody.createdAt).toBe('string');
    });


    test('Delete User API should return 204', async () => {
        const response = await apiContext.delete('https://reqres.in/api/users/2');
        expect(response.status()).toBe(204);
    });

});


