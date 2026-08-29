import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/users.js'

dotenv.config()

const migrateExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.Mongo_url)

    console.log('Connected to MongoDB')

    const result = await User.updateMany(
      {
        $or: [
          { isEmailVerified: { $exists: false } },
          { isEmailVerified: null },
          { isEmailVerified: false },
        ],
      },
      {
        $set: {
          isEmailVerified: true,
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: '',
        },
      }
    )

    console.log(
      `Migration complete. Updated ${result.modifiedCount} users.`
    )

    await mongoose.disconnect()

    console.log('Disconnected from MongoDB')
    process.exit(0)

  } catch (error) {
    console.error('Migration failed:', error)

    await mongoose.disconnect()
    process.exit(1)
  }
}

migrateExistingUsers()