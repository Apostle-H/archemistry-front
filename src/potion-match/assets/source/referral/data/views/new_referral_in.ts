export class NewReferralIn {
    referred_tg_id: number;
    referred_by_tg_id: number;

    public constructor(referredTgId: number, referredByTgId: number) {
        this.referred_tg_id = referredTgId;
        this.referred_by_tg_id = referredByTgId;
    }
}