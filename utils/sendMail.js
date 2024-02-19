import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";

const sendMail = async (options, template) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 1) Render HTML based on a pug template
  // const __dirname = dirname(fileURLToPath(import.meta.url));
  const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
    firstName: options.firstName,
    url: options.activationUrl,
    subject: options.subject,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    html,
    text: convert(html),
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
