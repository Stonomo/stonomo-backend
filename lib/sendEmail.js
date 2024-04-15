import { readFileSync } from 'fs'
import handlebars from 'handlebars';

export async function sendEmail(address, subj, payload, templateName) {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: provess.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		// compile template
		const template = readFileSync(path.join(__dirname + '/templates', templateName), "utf8");
		const compiledTemplate = handlebars.compile(template);

		// send email
		const mailOptions = {
			from: process.env.FROM_EMAIL,
			to: address,
			subject: subj,
			html: compiledTemplate(payload)
		};

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

	} catch (err) {

	}
}