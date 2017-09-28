import { PnpmOptions } from 'supi';
/**
 * Perform installation.
 * @example
 *     installCmd([ 'lodash', 'foo' ], { silent: true })
 */
export default function installCmd(input: string[], opts: PnpmOptions): Promise<void>;
