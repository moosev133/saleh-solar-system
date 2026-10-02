// Run interactively or pipe JSON on stdin. Never pass a password as a command argument.
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import readline from 'node:readline';
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stderr.write('Ready for credential JSON on stdin (input is hidden).\n');
}
const line = await new Promise(resolve => {
  const input = readline.createInterface({ input:process.stdin, terminal:false });
  input.once('line', value => { input.close(); resolve(value); });
});
if (process.stdin.isTTY) process.stdin.setRawMode(false);
let username, password;
try { ({username, password} = JSON.parse(line)); } catch { throw new Error('Expected credential JSON on stdin'); }
if (typeof username !== 'string' || !username || username.length > 100 || typeof password !== 'string' || !password || password.length > 256) throw new Error('Invalid credentials');
const salt = randomBytes(32);
const hash = pbkdf2Sync(password, salt, 600000, 32, 'sha256');
console.log(JSON.stringify({algorithm:'pbkdf2-sha256', iterations:600000, username:username.trim(), salt:salt.toString('hex'), hash:hash.toString('hex')}));
process.exit(0);
