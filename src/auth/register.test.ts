


import supertest from "supertest"
import { app } from "../app"
import path from "path"





describe( "register test", () => {

    type testObject = {
        email: string;
        username: string;
        password: string;
        bio: string;
        avatar: string;
    };

    type testObjectPartial = Partial<testObject>

    const __dirname = path.resolve(path.dirname(''))

    const avatarPath = path.join(__dirname, "images", "test.jpg")

    // test: missing fields
    it.each([
        [{ email: "emailtest@gmail.com", username: "test", password: "test", bio: "test" }, 422],
        [{ username: "test", password: "test", bio: "test", avatar:  avatarPath}, 422],
        [{ email: "emailtest@gmail.com", password: "test", bio: "test", avatar: avatarPath }, 422],
        [{ email: "emailtest@gmail.com", username: "test", bio: "test", avatar: avatarPath }, 422],
        [{ email: "emailtest@gmail.com", username: "test", password: "test", avatar: avatarPath }, 422]
      ])(
        "should return an error when a field is missing",
        async (fields: testObjectPartial, expectedStatus) => {
          const res = await supertest(app)
            .post("/api/register")
            .field("email", fields.email || "")  
            .field("username", fields.username || "")
            .field("bio", fields.bio || "")
            .field("password", fields.password || "")
            .attach("avatar", fields.avatar || "");
    
          expect(res.status).toBe(expectedStatus);
          expect(res.body).toEqual({ response: "missing a required field" });
        }
      );


      const invalidAvatarPath = path.join(__dirname, "images", "failed_test.jpeg")


    // test: invalid fields
    it.each([
        [{ email: "emailtestgmail.com", username: "test", password: "test", bio: "test", avatar:  avatarPath}, "email"],
        [{ email: "emailtest@gmail.com", username: "test", password: "test", bio: "A".repeat(500), avatar:  avatarPath}, "bio"],
        [{ email: "emailtest@gmail.com", username: "test", password: "test", bio: "test", avatar: invalidAvatarPath }, "avatar"],
        [{ email: "emailtest@gmail.com", username: "a".repeat(20), password: "test", bio: "test", avatar: avatarPath }, "username"],
      ])(
        "should return an error when a field is invalid",
        async (fields: testObject, invalidField) => {
          const res = await supertest(app)
            .post("/api/register")
            .field("email", fields.email)  
            .field("username", fields.username)
            .field("bio", fields.bio)
            .field("password", fields.password)
            .attach("avatar", fields.avatar);
    
          expect(res.status).toBe(422);
          expect(res.body).toEqual({ response: `invalid ${invalidField}` });
        }
      );

      // create an account to login
    it.each([
      [{ email: "oussamamajdouli1@gmail.com", username: "test", password: "test", bio: "test", avatar:  path.join(__dirname, "images", "test.jpg")}],
    ])(
      "should create a user with the info",
      async (fields: testObject) => {
        const res = await supertest(app)
          .post("/api/register")
          .field("email", fields.email)  
          .field("username", fields.username)
          .field("bio", fields.bio)
          .field("password", fields.password)
          .attach("avatar", fields.avatar);
  
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ response: "unverified user account created"});
      }
    );

})

