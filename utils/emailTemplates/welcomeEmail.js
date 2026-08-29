const welcomeEmail = (fullName) => {
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
        Thank you for joining us!
      </p>

      <p style="margin-top: 30px;">
        <strong>The FindArtisans Team</strong>
      </p>

    </div>
  `
}

export default welcomeEmail