import * as nodemailer from "nodemailer";
const emailProvider = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "h37122992@gmail.com",
        pass: "bfcx ozqb ashh lygf"
    }
});
async function sendVerificationEmail(email, link) {
    const emailTemplate = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600&display=swap" rel="stylesheet">

        <title>Confirm Your Sign Up</title>
        <style>
            body {
            background-color: #121212;
            color: #E0E0E0;
            font-family: "Rubik";
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            margin: 0;
            }
            .ks-27 {
            background-color: #1E1E1E;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            text-align: center;
            max-width: 400px;
            width: 100%;
            }
            .ks-27 h1 {
            font-size: 20px;
            margin-bottom: 1rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            color: white;
            }
            .ks-27 p {
            margin-bottom: 1.5rem;
            font-size: 1rem;
            line-height: 1.5;
            }
            .ks-27 a {
            display: inline-block;
            background-color: #1DB954;
            color: #121212;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: bold;
            transition: background-color 0.3s ease;
            }
            .ks-27 a:hover {
            background-color: #17a54d;
            }
            .footer {
            margin-top: 1.5rem;
            font-size: 0.875rem;
            color: #888;
            }
            .nl-21{
            height: 23px;
            filter: brightness(0) saturate(100%) invert(49%) sepia(66%) saturate(575%) hue-rotate(88deg) brightness(102%) contrast(87%);
            }
        </style>
        </head>
        <body>
        <div class="ks-27">
            <h1>Welcome to Ch<img class="nl-21" src="data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><g id='SVGRepo_bgCarrier' stroke-width='0'></g><g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g><g id='SVGRepo_iconCarrier'><path d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z' fill='%23ffffff'></path></g></svg>" alt="Custom SVG" />tify!</h1>
            <p>
            Thank you for signing up. To complete your registration, please confirm your email address by clicking the button below.
            </p>
            <a href="${link}" target="_blank">Confirm Email</a>
            <p class="footer">© 2025 Chatify. All rights reserved.</p>
        </div>
        </body>
        </html>`;
    const mailOptions = {
        from: "h37122992@gmail.com",
        to: email,
        subject: "verification",
        text: "verification",
        html: emailTemplate
    };
    emailProvider.sendMail(mailOptions, (e, info) => {
        if (e) {
            console.log('Error in sending email:', e);
            throw e;
        }
        else {
            console.log('Email sent:', info.response);
        }
    });
}
export default sendVerificationEmail;
