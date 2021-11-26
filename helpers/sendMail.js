const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');


//this is the part which sends the mail
let transporter = nodemailer.createTransport({
    // pool: true,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'yourmealmentor@gmail.com',
        service: 'gmail',
        pass: process.env.GMAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

let renderTemplate = (data, relativePath) => {
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath),
        data,
        function (err, template) {
            if (err) {
                console.log("Error in rendering template");
                return;
            }
            mailHTML = template;
        }
    )
    return mailHTML;
}

module.exports.sendForgotMail = (email, accessToken) => {

    let htmlString = renderTemplate({ accessToken: accessToken }, '/reset_password.ejs');
    transporter.sendMail({
        from: "yourmealmentor@gmail.com",
        to: email,
        subject: "Forgot Password TheMealMentor",
        html: htmlString

    }, (err, info) => {
        if (err) {
            console.log("Error in sending mail", err);
            return;
        }
        console.log("Message sent", info);
        return;
    })
}

module.exports.sendMail = (email, subject, payload) => {
    let htmlString = payload;
    console.log("Email in sendmail", email);
    transporter.sendMail({
        from: "yourmealmentor@gmail.com",
        to: email,
        subject: subject,
        html: payload

    }, (err, info) => {
        if (err) {
            console.log("Error in sending mail", err.message);
            return;
        }
        console.log("Message sent");
        return;
    })
}