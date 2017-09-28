export default function runScript(command: string, args: string[], opts: {
    cwd: string;
    log: Function;
    userAgent: string;
}): Promise<void> | Promise<{}>;
export declare function sync(command: string, args: string[], opts: {
    cwd: string;
    stdio: string;
    userAgent?: string;
}): any;
