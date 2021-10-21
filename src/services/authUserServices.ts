import axios from 'axios'
import { response } from 'express'

interface IAccessTokenResponse{
  // eslint-disable-next-line camelcase
  access_token:string
}
interface IUserResponse{
  // eslint-disable-next-line camelcase
  avatar_url:string,
  login:string,
  id:number,
  name:string
}

class AuthUserService {
  async execute (code:String) {
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

      return resp.data
    } catch (err) {
      return response.status(400).json('Error: ' + err)
    }
  }
}

export { AuthUserService }
