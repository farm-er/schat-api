


import supertest from "supertest"
import { app } from "../app"
import User from "../user/user.model";
import { hash } from "../utils/hash";
import { v4 as uuidv4 } from "uuid"
import path from "path";
import { readFileSync } from "fs";



// we need some mock data

beforeAll( async () => {

    const email = "logintest@gmail.com"
    const password = "logintest"
    const username = "logintest"
    const bio = "logintest"

    const avatar = readFileSync(path.join(path.resolve(path.dirname('')), "images", "test.jpg")); 

    const saltRounds: number = 10
    const hashedPass : string = await hash( password, saltRounds)

    const id = uuidv4().toString()

    const user: User = new User({
        createdAt: new Date(),
        id: id,
        username: username,
        email: email,
        password: hashedPass,
        bio: bio,
        status: "",
        verified: false,
        avatar: avatar
    })

    const result = await User.addUser( user);
})

describe( "login test", () => {

    type testObject = {
        email: string;
        password: string;
    };

    type testObjectPartial = Partial<testObject>

    // test: missing fields
    it.each([
        [{ email: "emailtest@gmail.com"}, 422, { response: "missing a required field"}],
        [{ password: "test"}, 422, { response: "missing a required field"}],
    ])(
        "should return an error when a field is missing",
        async (fields: testObjectPartial, expectedStatus, response) => {
            const res = await supertest(app)
                .post("/api/login")
                .send( fields)

            expect(res.status).toBe(expectedStatus);
            expect(res.body).toEqual(response);
        }
    )
    
    // test: invalid credentials
    it.each([
        [{ email: "emailnotregistered@gmail.com", password: "test"}, 401, { response: "invalid credentials"}],
        [{ email: "emailtest@gmail.com", password: "wrongpass"}, 401, { response: "invalid credentials"}],
    ])(
        "should return an error when the credentials are invalid",
        async (fields: testObject, expectedStatus, response) => {
            const res = await supertest(app)
                .post("/api/login")
                .send(fields)

            expect(res.status).toBe(expectedStatus);
            expect(res.body).toEqual(response);
        }
    );


    it.each([
        [{ email: "logintest@gmail.com", password: "logintest"}, 200],
    ])(
        "should return a token",
        async (fields: testObject, expectedStatus) => {
            const res = await supertest(app)
                .post("/api/login")
                .send(fields)

            expect(res.status).toBe(expectedStatus);
            expect(res.body).toHaveProperty("token");
            expect(typeof res.body.token).toBe("string");
            expect(res.body.token.length).toBeGreaterThan(0); 
        }
    );

})
