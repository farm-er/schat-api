import { validate as isUuid4 } from "uuid"
import User from "../user/user.model"





export async function validateReceiverId( id: string) : Promise<boolean> {

    if (!id) return false

    if (!isUuid4( id)) return false

    const user = await User.getUserById( id)

    if (!user) return false

    return true
}



