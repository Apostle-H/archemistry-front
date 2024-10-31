export class AuthIn {
    init_data_raw: string;
    referred_by_tg_id: number;
    init_ton: {
        address: string;
        signature: string;
    }
    auth_type: string;

    public constructor(initDataRaw: string, referredByTgId: number = null) {
        this.init_data_raw = initDataRaw;
        this.referred_by_tg_id = referredByTgId;
        this.init_ton = {
            address: "---",
            signature: "full"
        };
        this.auth_type = "telegram";
    }
}