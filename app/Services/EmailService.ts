import sgMail from '@sendgrid/mail';
import Env from '@ioc:Adonis/Core/Env';

sgMail.setApiKey(Env.get('SENDGRID_API_KEY'));

export default class EmailService {
    public static async sendEmail(to: string, templateId: string, dynamicTemplateData?: any) {
        const msg = {
            to,
            from: Env.get('ADMIN_EMAIL'),
            templateId,
            dynamicTemplateData,
        };

        try {
            await sgMail.send(msg);
        }

        catch(e) {
            throw new Error(e);
        }

    }

    public static async sendVerificationEmail(to: string, dynamicTemplateData: any) {
        await this.sendEmail(to, "d-9b090b1722394c31b006564d697df8d9", dynamicTemplateData);
    }

    public static async sendWelcomeEmail(to: string) {
        await this.sendEmail(to, "d-6608825f02f8449b844975531d840f23");
    }
}
