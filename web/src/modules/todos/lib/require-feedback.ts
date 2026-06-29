export function deriveRequireFeedback(
  assigneeId: string,
  currentMemberId: string | null,
): boolean {
  if (!assigneeId || !currentMemberId) return false
  return assigneeId !== currentMemberId
}
