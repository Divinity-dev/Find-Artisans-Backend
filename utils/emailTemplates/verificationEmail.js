const verificationEmail = (
  fullName,
  verificationUrl
) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px 20px;
      color: #1f2937;
      line-height: 1.6;
    ">

      <h2 style="
        color: #f97316;
        margin-bottom: 20px;
      ">
        Verify your FindArtisans email
      </h2>

      <p>
        Hello ${fullName},
      </p>

      <p>
        Thank you for creating your FindArtisans account.
        Please verify your email address by clicking the button below.
      </p>

      <div style="
        text-align: center;
        margin: 30px 0;
      ">

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            background-color: #f97316;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Verify My Email
        </a>

      </div>

      <p>
        This verification link will expire in
        <strong>24 hours</strong>.
      </p>

      <p>
        If you did not create a FindArtisans account,
        you can safely ignore this email.
      </p>

      <p style="margin-top: 30px;">
        <strong>The FindArtisans Team</strong>
      </p>

    </div>
  `
}

export default verificationEmail