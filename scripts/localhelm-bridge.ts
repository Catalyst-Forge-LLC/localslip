/**
 * JSON bridge so LocalHelm can host the Ports tab without reimplementing leases.
 * Invoked by localhelm.plugin.mjs in this repo.
 */
import { helmPluginBoards } from '../src/lib/helm-plugin-board.ts';
import { getBoard } from '../src/lib/server/board.ts';
import { getDb } from '../src/lib/server/db.ts';

getDb();
const boards = helmPluginBoards(await getBoard());
process.stdout.write(`${JSON.stringify(boards)}\n`);
