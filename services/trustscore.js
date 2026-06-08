// services/trustScoreService.js

export const calculateTrustScore = ({
  totalJobs,
  completedJobs,
  cancelledJobs,
  isVerified,
}) => {
  let score = 0

  // 1. Base trust from completed jobs (this is the ONLY positive driver)
  score += completedJobs * 0.4

  // 2. Penalize cancellations heavily
  score -= cancelledJobs * 0.6

  // 3. Prevent fake inflation from low activity users
  if (totalJobs < 3) {
    score *= 0.5
  }

  // 4. Verification = small credibility boost, not dominance
  if (isVerified) {
    score += 0.5
  }

  // 5. Normalize to 1–5 scale
  score = Math.max(1, Math.min(5, score))

  return Number(score.toFixed(1))
}