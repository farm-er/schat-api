import { Response } from "express";






export function jsonResponse( res: Response, statusCode: number, message: string) {
    res.status(statusCode).json( { response: message} )
}