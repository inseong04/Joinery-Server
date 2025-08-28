import { MailerAsyncOptions } from "@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import * as path from "path";

export class mailerConfig implements MailerAsyncOptions {
    useFactory = () => ({
        transport: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        },
        defaults: {
            from: '"Joinery" <joinery0815@gmail.com>',
        },
        template: {
            dir: path.join(process.cwd(), "src/notifications/templates"),
            adapter: new EjsAdapter(),
            options: {
                strict: false,
            },
        },
    });
}