import sgMail from '@sendgrid/mail';
import Env from '@ioc:Adonis/Core/Env';

sgMail.setApiKey(Env.get('SENDGRID_API_KEY'));

export default class EmailService {
    public static async sendEmail(to: string, templateId: string, dynamicTemplateData: any) {
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

    public static async sendVerificationEmail(to: string, verificationToken: string) {
        const dynamicTemplateData = {
            verificationToken,
        };

        await this.sendEmail(to, Env.get('VERIFICATION_EMAIL_TEMPLATE_ID'), dynamicTemplateData);
    }
}
