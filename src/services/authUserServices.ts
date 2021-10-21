import axios from 'axios'
import prismaClient from '../prismaConnect/prisma'
import { sign } from 'jsonwebtoken'
import { response } from 'express'

interface IAccessTokenResponse {
  // eslint-disable-next-line camelcase
  access_token: string
}
interface IUserResponse {
  // eslint-disable-next-line camelcase
  avatar_url: string,
  login: string,
  id: number,
  name: string
}

class AuthUserService {
  async execute(code: String) {
    try {
      const url = 'https://github.com/login/oauth/access_token'
      // eslint-disable-next-line no-unused-vars
      const { data: accessTokenResponse } =
        await axios.post<IAccessTokenResponse>(url, null, {
          params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
          },
          headers: {
            Accept: 'application/json'
          }
        })

      const resp = await axios.get<IUserResponse>('https://api.github.com/user', {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`
        }
      })

      const { login, id, avatar_url, name } = resp.data

      let user = await prismaClient.user.findFirst({
        where: {
          github_id: id
        }
      })
      if (!user) {
        user = await prismaClient.user.create({
          data: {
            github_id: id,
            login,
            avatar_url,
            name
          }
        })
      }

      const token = sign(
        {
          user: {
            name: user.name,
            avatar_url: user.avatar_url,
            id: user.id
          },
        },
        process.env.JWT_SECRET, {
        subject: user.id,
        expiresIn: "1d"
      }
      )

      return { token, user }
    } catch (err) {
      return response.status(400).json('Error: ' + err.message)
    }
  }
}

export { AuthUserService }
