/* eslint-disable no-unused-vars */
import { Request, Response } from 'express'
import { AuthUserService } from '../services/authUserServices'

class AuthUserController {
  async handle (request:Request, response:Response) {
    try {
      const { code } = request.body
      const service = new AuthUserService()
      const result = await service.execute(code)

      return response.json(result)
    } catch (err) {
      return response.status(400).json('Error: ' + err)
    }
  }
}

export { AuthUserController }
