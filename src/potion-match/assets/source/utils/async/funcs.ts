import { EventTarget } from "cc";

export function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
    return new Promise((resolve, reject) => {
        let rejectedCount = 0;
        const errors: any[] = [];

        if (promises.length === 0) {
            return reject(new Error("All promises were rejected"));
        }

        promises.forEach((promise, index) => {
            promise
                .then(resolve)
                .catch(error => {
                    errors[index] = error;
                    rejectedCount += 1;

                    if (rejectedCount === promises.length) {
                        reject(new Error("All promises were rejected"));
                    }
                });
        });
    });
}

export function eventTargetEmptyWithPormise(
    eventTarget: EventTarget, 
    event: any, 
    func: (resolve: (value: void | PromiseLike<void>) => void) => void
): Promise<void> {
    return new Promise<void>((resolve) => {
        eventTarget.once(event, () => func(resolve));
    });
}

export function eventTargetWithPormise<T>(
    eventTarget: EventTarget, 
    event: any, 
    func: (value: T, resolve: (value: void | PromiseLike<void>) => void) => void
): Promise<void> {
    return new Promise<void>((resolve) => {
        eventTarget.once(event, (value) => func(value, resolve));
    });
}