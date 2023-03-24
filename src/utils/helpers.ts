export function formatMilliseconds(milliseconds: number, includeMs: boolean): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    const minute = minutes.toString().padStart(2, '0');
    const second = seconds.toString().padStart(2, '0');
    const millisecond = ms.toString().padStart(3, '0');

    return includeMs ? `${minute}:${second}:${millisecond}` : `${minute}:${second}`;
}