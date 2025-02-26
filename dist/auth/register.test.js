import supertest from "supertest";
import { app } from "../app";
import path from "path";
describe("register test", () => {
    it.each([
        // Define test cases with one missing field each
        [{ email: "emailtest@gmail.com", username: "test", password: "test", bio: "test" }, "avatar", 422],
        [{ username: "test", password: "test", bio: "test", avatar: path.join(__dirname, "test.jpeg") }, "email", 422],
        [{ email: "emailtest@gmail.com", password: "test", bio: "test", avatar: path.join(__dirname, "test.jpeg") }, "username", 422],
        [{ email: "emailtest@gmail.com", username: "test", bio: "test", avatar: path.join(__dirname, "test.jpeg") }, "password", 422],
        [{ email: "emailtest@gmail.com", username: "test", password: "test", avatar: path.join(__dirname, "test.jpeg") }, "bio", 422]
    ])("should return an error when %s is missing", async (fields, missingField, expectedStatus) => {
        const res = await supertest(app)
            .post("/api/register")
            .field("email", fields.email || "")
            .field("username", fields.username || "")
            .field("bio", fields.bio || "")
            .field("password", fields.password || "")
            .attach("avatar", fields.avatar || "");
        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual({ response: `missing a required field: ${missingField}` });
    });
});
