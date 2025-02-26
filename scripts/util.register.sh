
curl -s -X POST http://localhost:3000/api/register \
-F "username=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5;)" \
-F "bio=Hello, I am John Doe!" \
-F "email=$1" \
-F "password=secret123" \
-F "avatar=@../images/test.jpg"