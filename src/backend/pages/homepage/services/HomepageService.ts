import { Request, Response } from 'express'

export class HomepageService {
  public async render (_req: Request, res: Response): Promise<void> {
    const pageBanner = {
      title: process.env.PROJECT_NAME,
      info: process.env.COMMON_DESC
    }

    return res.render('templates/pages/homepage/index', { pageBanner: pageBanner })
  }
}
