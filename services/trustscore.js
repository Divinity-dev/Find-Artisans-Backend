// services/trustScoreService.js

export const calculateTrustScore = ({
  totalJobs = 0,
  completedJobs = 0,
  cancelledJobs = 0,
  isVerified = false,
}) => {
  // Everyone starts neutral
  let score = 2.5;

  // Reward completed jobs
  score += completedJobs * 0.35;

  // Penalize cancellations heavily
  score -= cancelledJobs * 0.75;

  // Verified users get a small credibility boost
  if (isVerified) {
    score += 0.5;
  }

  // Experienced users earn a little extra confidence
  if (totalJobs >= 10) {
    score += 0.3;
  }

  if (totalJobs >= 25) {
    score += 0.3;
  }

  // Clamp to 1–5
  score = Math.max(1, Math.min(5, score));

  return Number(score.toFixed(1));
};