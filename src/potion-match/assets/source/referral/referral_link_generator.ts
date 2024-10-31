export function generate_referral_link(userTgId: number): string {
    return `https://t.me/ArchemistryBot/match?startapp=${userTgId}`
}