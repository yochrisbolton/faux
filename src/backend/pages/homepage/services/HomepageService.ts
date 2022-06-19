import { Request, Response } from 'express'

export class HomepageService {
  public async render (_req: Request, res: Response): Promise<void> {
    return res.render('templates/pages/homepage/index')
  }
}
