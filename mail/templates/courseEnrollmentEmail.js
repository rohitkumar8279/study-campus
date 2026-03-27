
exports.courseEnrollmentEmail = (courseName, name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Course Registration Confirmation</title>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: auto;
        padding: 20px;
        text-align: center;
      }
      .logo {
        max-width: 180px;
        margin-bottom: 20px;
      }
      .message {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .body {
        font-size: 16px;
        margin-bottom: 20px;
      }
      .cta {
        display: inline-block;
        padding: 10px 20px;
        background-color: #FFD60A;
        color: #000;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 15px;
      }
      .support {
        font-size: 14px;
        color: #777;
        margin-top: 20px;
      }
      .highlight {
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo" />

      <div class="message">Course Registration Confirmation 🎉</div>

      <div class="body">
        <p>Dear ${name},</p>

        <p>
          You have successfully enrolled in
          <span class="highlight">"${courseName}"</span>.
        </p>

        <p>Start learning now from your dashboard.</p>

        <a class="cta" href="https://studynotion-edtech-project.vercel.app/dashboard">
          Go to Dashboard
        </a>
      </div>

      <div class="support">
        Need help? Contact us at
        <a href="mailto:info@studynotion.com">info@studynotion.com</a>
      </div>
    </div>
  </body>
  </html>
  `;
};