/** Roll up activity rows (already filtered by period) into headline numbers. */
export function aggregateActivityStats(activities) {
  return activities.reduce(
    (acc, a) => ({
      callsMade: acc.callsMade + (a.callsMade || 0),
      decisionMakers: acc.decisionMakers + (a.decisionMakers || 0),
      emailsSent: acc.emailsSent + (a.emailsSent || 0),
      linkedinTouches: acc.linkedinTouches + (a.linkedinTouches || 0),
      followUps: acc.followUps + (a.followUps || 0),
      meetingsBooked: acc.meetingsBooked + (a.meetingsBooked || 0),
      meetingsAttended: acc.meetingsAttended + (a.meetingsAttended || 0),
    }),
    {
      callsMade: 0,
      decisionMakers: 0,
      emailsSent: 0,
      linkedinTouches: 0,
      followUps: 0,
      meetingsBooked: 0,
      meetingsAttended: 0,
    }
  )
}

export function omnichannelTouches(stats) {
  return stats.callsMade + stats.emailsSent + stats.linkedinTouches
}

export function showRatePercent(stats) {
  const { meetingsBooked, meetingsAttended } = stats
  if (meetingsBooked <= 0) return null
  return Math.round((meetingsAttended / meetingsBooked) * 1000) / 10
}
