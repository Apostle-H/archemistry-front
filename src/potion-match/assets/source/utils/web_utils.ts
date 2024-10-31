import { EventTarget } from "cc";
import { AuthIn } from "../auth/data/auth_in";
import { checkApiAvailablity as tgApiAvailablity } from "./tg/funcs";


export abstract class WebUtils {
    private static baseUrl: string = "https://potion-match-dev.architecton.site/api/v1";

    private static jwtToken: string;
    private static _tgId: number;

    public static readonly authorizedEt = new EventTarget();

    public static get tgId() {
        return WebUtils._tgId;
    }

    public static async auth() {
        const tgApiAvailable = tgApiAvailablity(); 

        const init_data_raw = !tgApiAvailable
        ? "query_id=AAFW_MYaAAAAAFb8xhr9aiHd&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Dev%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1727257101&hash=91a8577e5c730d0160b7690a16f7ccb18d08e8fd315b04924f694071d28923ea"
        : globalThis.Telegram.WebApp.initData;
        
        WebUtils._tgId = tgApiAvailable ? globalThis.Telegram.WebApp.initDataUnsafe.user.id: 1;

        const queryString = globalThis.location.search;
        const urlParams = new URLSearchParams(queryString);

        let referredByTgId = null
        if (urlParams.has('tgWebAppStartParam')) {
            referredByTgId = urlParams.get('tgWebAppStartParam') as unknown as number;
        }

        await this.post("/auth", new AuthIn(init_data_raw, referredByTgId))
        .then((response: Response) => response.json().then((json) => {
            this.jwtToken = json.access_token;

            this.authorizedEt.emit(true.toString())
        }));
    }

    public static async get_with_auth(
        path: string, 
        params: Record<string, string | number> = {},
        headers: Headers = new Headers()
    ): Promise<Response> {
        headers.append("Authorization", "Bearer " + this.jwtToken)

        return this.get(path, params, headers)
    }

    private static async get(
        path: string, 
        params: Record<string, string | number> = {},
        headers: Headers = new Headers()
    ): Promise<Response> {
        headers.append("Content-Type", "application/json");
        headers.append("Access-Control-Allow-Origin", this.baseUrl);

        const url = this.baseUrl + path + "?" + params.toString();
        return await fetch(url, {
            method: "GET",
            headers: headers
        })
    } 

    public static async post_with_auth(
        path: string, 
        payload: object,
        headers: Headers = new Headers()
    ): Promise<Response>{
        headers.append("Authorization", "Bearer " + this.jwtToken);

        return this.post(path, payload, headers);
    }

    private static async post(
        path: string, 
        payload: object,
        headers: Headers = new Headers()
    ): Promise<Response> {
        headers.append("Content-Type", "application/json");
        headers.append("Access-Control-Allow-Origin", this.baseUrl);

        const url = this.baseUrl + path;
        return await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        }); 
    }
}