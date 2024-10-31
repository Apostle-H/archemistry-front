import { Tween } from "cc"

export function tweenWithPromiseCall<T>(tween: Tween<T>): Promise<void> {
    return new Promise((resolve) => {
        tween.call(resolve)
        .start()
    })
}