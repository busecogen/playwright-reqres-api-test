import { test, expect, request, APIRequestContext } from '@playwright/test';

const constants = {
    baseUrl: 'https://reqres.in/api',
    headers: {
        apiKey: { 'x-api-key': 'reqres-free-v1' },
        jsonContent: { 'Content-Type': 'application/json' },
    },
    loginPayload: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
    },
    createUserPayload: {
        name: 'John Doe',
        job: 'QA Tester',
    },
    userIdToDelete: 2,
    usersPage: 2,
};

test.describe('ReqRes API tests', () => {
    let apiContext: APIRequestContext;

    test.beforeAll(async () => {
        apiContext = await request.newContext({
            extraHTTPHeaders: {
                ...constants.headers.apiKey,
            },
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('Login API should return 200 and token', async () => {
        const response = await apiContext.post(`${constants.baseUrl}/login`, {
            data: constants.loginPayload,
            headers: {
                ...constants.headers.jsonContent,
            },
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.token).toBeDefined();
        expect(typeof responseBody.token).toBe('string');
        expect(responseBody.token.length).toBeGreaterThan(0);
    });

    test('List users API should return 200 and users list', async () => {
        const response = await apiContext.get(`${constants.baseUrl}/users?page=${constants.usersPage}`);
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.page).toBe(constants.usersPage);
    });

    test('Fetch Users API should return 200 and at least 6 users', async () => {
        const response = await apiContext.get(`${constants.baseUrl}/users?page=${constants.usersPage}`);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();

        expect(responseBody.data).toBeDefined();
        expect(Array.isArray(responseBody.data)).toBe(true);
        expect(responseBody.data.length).toBeGreaterThanOrEqual(6);
    });

    test('Create User should return 201 and response contains id and createdAt', async () => {
        const response = await apiContext.post(`${constants.baseUrl}/users`, {
            data: constants.createUserPayload,
            headers: {
                ...constants.headers.jsonContent,
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
        const response = await apiContext.delete(`${constants.baseUrl}/users/${constants.userIdToDelete}`);
        expect(response.status()).toBe(204);
    });
});
