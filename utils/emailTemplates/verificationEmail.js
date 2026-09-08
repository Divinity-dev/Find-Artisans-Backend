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
        Welcome to FindArtisans, ${fullName}! 🎉
      </h2>

      <p>
        Thank you for creating your account with FindArtisans.
        We're excited to have you on the platform.
      </p>

      <p>
        FindArtisans makes it easier for customers to discover
        trusted artisans and skilled professionals across Nigeria.
      </p>

      <!-- VERIFICATION SECTION -->

      <div style="
        background-color: #fff7ed;
        border-left: 4px solid #f97316;
        padding: 15px 18px;
        margin: 25px 0;
      ">

        <p style="
          margin-top: 0;
          font-weight: bold;
          color: #111827;
        ">
          One more step: verify your email address
        </p>

        <p style="margin-bottom: 0;">
          Please verify your email address to activate your account
          and gain access to FindArtisans.
        </p>

      </div>

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

      <!-- GETTING STARTED -->

      <h3 style="color: #111827;">
        What should you do next?
      </h3>

      <ol>
        <li style="margin-bottom: 10px;">
          <strong>Complete your profile</strong> so other users
          can know more about you.
        </li>

        <li style="margin-bottom: 10px;">
          <strong>Update your location</strong> by selecting your
          State, City and LGA. Your location helps us connect you
          with relevant people and services around you.
        </li>

        <li style="margin-bottom: 10px;">
          <strong>Add your skills or services</strong> if you
          registered as a worker/artisan.
        </li>

        <li style="margin-bottom: 10px;">
          Keep your profile information accurate and up to date.
        </li>
      </ol>

      <p>
        A complete profile gives you a better experience on
        FindArtisans and helps people find the right services.
      </p>

      <p>
        We're happy to have you with us!
      </p>

      <p style="margin-top: 30px;">
        <strong>The FindArtisans Team</strong>
      </p>

      <hr style="
        margin: 30px 0;
        border: none;
        border-top: 1px solid #e5e7eb;
      " />

      <p style="
        font-size: 12px;
        color: #6b7280;
      ">
        If you did not create a FindArtisans account,
        you can safely ignore this email.
      </p>

    </div>
  `
}

export default verificationEmail

