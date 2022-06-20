import { Request, Response } from 'express'

export class TermsService {
  public render (_req: Request, res: Response): void {
    const pageBanner = {
      title: 'Privacy Policy',
      info: `${process.env.PROJECT_NAME ?? 'faux'} <strong>Privacy Policy</strong>`
    }

    return res.render('templates/pages/terms/privacy-policy', { pageBanner: pageBanner })
  }

  public renderPrivacyPolicy (_req: Request, res: Response): void {
    const pageBanner = {
      title: 'Privacy Policy',
      info: `${process.env.PROJECT_NAME ?? 'faux'} <strong>Privacy Policy</strong>`
    }

    return res.render('templates/pages/terms/privacy-policy', { pageBanner: pageBanner })
  }

  public renderTermsOfService (_req: Request, res: Response): void {
    const pageBanner = {
      title: 'Terms of Service',
      info: `${process.env.PROJECT_NAME ?? 'faux'} <strong>Terms of Service</strong>`
    }

    return res.render('templates/pages/terms/terms-of-service', { pageBanner: pageBanner })
  }

  public renderCookiePolicy (_req: Request, res: Response): void {
    const pageBanner = {
      title: 'Cookie Policy',
      info: `${process.env.PROJECT_NAME ?? 'faux'} <strong>Cookie Policy</strong>`
    }

    return res.render('templates/pages/terms/cookie-policy', { pageBanner: pageBanner })
  }

  public renderAcceptableUsePolicy (_req: Request, res: Response): void {
    const pageBanner = {
      title: 'Acceptable Use Policy',
      info: `${process.env.PROJECT_NAME ?? 'faux'} <strong>Acceptable Use Policy</strong>`
    }

    return res.render('templates/pages/terms/acceptable-use-policy', { pageBanner: pageBanner })
  }
}
