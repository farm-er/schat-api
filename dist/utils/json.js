export function jsonResponse(res, statusCode, message) {
    res.status(statusCode).json({ response: message });
}
