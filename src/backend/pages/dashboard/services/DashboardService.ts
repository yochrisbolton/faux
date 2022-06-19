import { Request, Response } from 'express'
import { GetDoesUsernameExist } from 'pages/__common/authentication/models/user/GET/GetDoesUsernameExist'
import { GetPasswordHashByToken } from 'pages/__common/authentication/models/user/GET/GetPasswordHashByToken'
import { GetUserIdByToken } from 'pages/__common/authentication/models/user/GET/GetUserIdByToken'
import { UpdatePasswordHashByToken } from 'pages/__common/authentication/models/user/UPDATE/UpdatePasswordHashByToken'
import { UserServices } from 'pages/__common/authentication/services/UserServices'
import { UpdateUserInformtaion } from '../models/UPDATE/UpateUserInformation'
import { GetAllUserInformation } from '../models/GET/GetAllUserInformation'
import { DeleteUserByUserId } from '../models/DELETE/DeleteUserById'
import { GetUsernameByToken } from 'pages/__common/authentication/models/user/GET/GetUsernameByToken'
import { GetUserInfoByToken } from '../models/GET/GetUserInfoByToken'
import striptags from 'striptags'

export class DashboardService {
  public async render (req: Request, res: Response): Promise<void> {
    const info = await GetUserInfoByToken(req.body.hashedToken)

    const pageBanner = {
      title: 'Account Information',
      info: 'Manage your account information, including username and password'
    }

    return res.render('templates/pages/dashboard/dashboard', { info: info, pageBanner: pageBanner })
  }

  public async renderManage (_req: Request, res: Response): Promise<void> {
    const pageBanner = {
      title: 'Manage Information',
      info: 'Download your information or delete your account'
    }

    return res.render('templates/pages/dashboard/manage', { pageBanner: pageBanner })
  }

  public async updateInfo (req: Request, res: Response): Promise<void> {
    const username = striptags(req.body.username ?? '')
    const email = striptags(req.body.email ?? '')
    const hashedToken = striptags(req.body.hashedToken ?? '')

    if (username === '' || email === '' || hashedToken === '') {
      throw new Error('Missing required username or email')
    }

    const UserService = UserServices.getInstance()

    if (!UserService.isUsernameValid(username)) {
      throw new Error('Username isn\'t valid')
    }

    if (await GetDoesUsernameExist(username) && await GetUsernameByToken(hashedToken) !== username) {
      throw new Error('Username already in use')
    }

    await UpdateUserInformtaion(hashedToken, username, email)

    const info = await GetUserInfoByToken(req.body.hashedToken)
    return res.render('templates/pages/dashboard/dashboard', { info: info })
  }

  public async updatePassword (req: Request, res: Response): Promise<void> {
    const currentPassword = striptags(req.body['password-current'] ?? '')
    const newPassword = striptags(req.body['new-password'] ?? '')
    const newPasswordConf = striptags(req.body['new-password-conf'] ?? '')
    const hashedToken = striptags(req.body.hashedToken ?? '')

    if (currentPassword === '' || newPassword === '' || newPasswordConf === '' || hashedToken === '') {
      throw new Error('Missing required current password or new password')
    }

    if (newPassword !== newPasswordConf) {
      throw new Error('Password mis-match')
    }

    const UserService = UserServices.getInstance()

    if (!UserService.isPasswordValid(newPassword)) {
      throw new Error('Password doesn\'t meet requirements')
    }

    const currentPasswordHash = await GetPasswordHashByToken(hashedToken)

    if (!(await UserService.doesPasswordMatchHash(currentPasswordHash, currentPassword))) {
      throw new Error('Incorrect password')
    }

    const newPasswordHash = await UserService.hashPassword(newPassword)

    await UpdatePasswordHashByToken(hashedToken, newPasswordHash)

    const info = await GetUserInfoByToken(req.body.hashedToken)
    return res.render('templates/pages/dashboard/dashboard', { info: info })
  }

  public async downloadInformation (req: Request, res: Response): Promise<void> {
    const hashedToken = striptags(req.body.hashedToken ?? '')

    if (hashedToken === '') {
      throw new Error('Missing user auth')
    }

    const userObject = await GetAllUserInformation(hashedToken)

    const downloadObject = {
      user_object: userObject
    }

    const downloadJson = JSON.stringify(downloadObject)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(downloadJson, 'ascii')
  }

  public async deleteAccount (req: Request, res: Response): Promise<void> {
    const hashedToken = striptags(req.body.hashedToken ?? '')

    if (hashedToken === '') {
      throw new Error('Missing user auth')
    }

    const userId = await GetUserIdByToken(hashedToken)

    await DeleteUserByUserId(userId)

    res.clearCookie('auth-token')
    res.redirect('/')
  }
}
