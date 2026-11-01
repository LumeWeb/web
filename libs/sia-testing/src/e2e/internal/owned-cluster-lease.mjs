/// <reference types="node" />
// @ts-check
/**
 * Keeps the cluster mutation lock held until the complete owned process tree has
 * exited. A Python subreaper adopts detached descendants, while pidfds and kernel
 * parentage checks keep teardown signals from selecting unrelated reused PIDs.
 *
 * The inherited locked file description proves ownership directly. Worker pools
 * that close extra descriptors must instead prove stable ancestry to this exact
 * guardian program and its still-locked inode; an environment flag is insufficient.
 *
 * Readiness, exact resource cleanup and postflight remain the supervised command's
 * responsibility. A teardown deadline can trigger stronger signals but cannot
 * release exclusion while an owned kernel child remains.
 */
import { closeSync, constants, openSync, writeSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";

/** Every mutating suite must use the same lock, including its SDK subprocesses. */
export const clusterLockPath = "/tmp/sia-testing-exclusive-cluster.lock";
// A subreaper owns detached orphans too; process-group signals alone miss descendants that call setsid.
const guardianProgram = String.raw`
import ctypes,fcntl,os,signal,subprocess,sys,time,json
spec=json.loads(sys.argv[1])
if ctypes.CDLL(None,use_errno=True).prctl(36,1,0,0,0)!=0: raise RuntimeError("subreaper unavailable")
if not hasattr(os,"pidfd_open") or not hasattr(signal,"pidfd_send_signal"): raise RuntimeError("pidfd unavailable")
stopping=False
def interrupted(sig,frame):
 global stopping
 stopping=True
for sig in (signal.SIGTERM,signal.SIGINT,signal.SIGHUP): signal.signal(sig,interrupted)
if spec["acquire"]:
 lockfd=os.open(spec["lockPath"],os.O_CREAT|os.O_RDWR|os.O_NOFOLLOW,0o600)
 lease_end=time.monotonic()+1200
 while True:
  try: fcntl.flock(lockfd,fcntl.LOCK_EX|fcntl.LOCK_NB);break
  except BlockingIOError:
   if stopping or time.monotonic()>lease_end: print("owned-process lease timeout",file=sys.stderr);sys.exit(1)
   time.sleep(.05)
else:
 lockfd=int(os.environ["SIA_NATIVE_TOKEN_LOCK_FD"])
env=dict(os.environ,SIA_NATIVE_TOKEN_LOCK_FD=str(lockfd))
def direct_children():
 result=set()
 for task in os.listdir("/proc/self/task"):
  try: result.update(map(int,open("/proc/self/task/"+task+"/children").read().split()))
  except FileNotFoundError: pass
 return result
def send_owned(sig):
 for pid in direct_children():
  try:
   fd=os.pidfd_open(pid)
   try:
    # P_PIDFD wait verifies kernel parentage before any signal; PID reuse cannot select an unrelated process.
    os.waitid(os.P_PIDFD,fd,os.WEXITED|os.WNOHANG|os.WNOWAIT)
    signal.pidfd_send_signal(fd,sig)
   finally: os.close(fd)
  except (ProcessLookupError,ChildProcessError): pass
def reap():
 while True:
  try:
   pid,status=os.waitpid(-1,os.WNOHANG)
   if pid==0: return False
  except ChildProcessError: return True
code=1
try:
 child=subprocess.Popen(spec["command"],env=env,pass_fds=(lockfd,),start_new_session=True)
 end=time.monotonic()+spec["deadlineMs"]/1000
 while child.poll() is None and not stopping and time.monotonic()<end: time.sleep(.01)
 forced=child.poll() is None
 code=child.returncode if not forced else 1
 if forced: print("owned-process deadline or interruption; recovery retained",file=sys.stderr)
except BaseException:
 print("owned-process supervision failed; recovery retained",file=sys.stderr)
grace=time.monotonic()+spec["graceMs"]/1000
warned=False
while True:
 try:
  if not direct_children() and reap(): break
  code=code or 1
  send_owned(signal.SIGTERM if time.monotonic()<grace else signal.SIGKILL)
  if reap(): break
 except BaseException:
  code=1
 if not warned and time.monotonic()>grace+5:
  print("owned-process teardown blocked; mutex retained",file=sys.stderr);warned=True
 time.sleep(.01)
# Never unlock on a teardown timeout or diagnostic failure while any owned kernel child remains.
if code!=0 and spec["acquire"] and spec.get("manifestPath"):
 print(json.dumps({"category":"private-recovery-retained","path":spec["manifestPath"]}),flush=True)
sys.exit(code if code is not None and code>=0 else 1)
`;

/** Consent and a kernel-held shared lease must precede any admin mutation. */
export async function assertMutationAllowed() {
  if (process.env.SIA_TEST_ALLOW_MUTATION !== "1")
    throw new Error("Mutation consent is required");
  try {
    await verifyNativeLease(
      process.env.SIA_NATIVE_TOKEN_LOCK_FD,
      clusterLockPath,
    );
  } catch {
    try {
      await verifyOwnedGuardian(clusterLockPath);
    } catch (cause) {
      throw new Error("Inherited cluster lease is required", { cause });
    }
  }
}

/** Both runner and SDK boundaries use a subreaper which keeps the locked OFD through descendant teardown. */
/** @param {string} command @param {string[]} args @param {NodeJS.ProcessEnv} env @param {boolean} acquire @param {string} lockPath @param {number} deadlineMs @param {number} graceMs @param {string} [cwd] @param {string} [privateLogPath] @returns {Promise<number>} */
export async function runWithGuardian(
  command,
  args,
  env,
  acquire,
  lockPath,
  deadlineMs,
  graceMs,
  cwd = process.cwd(),
  privateLogPath,
) {
  if (!acquire) await verifyNativeLease(env.SIA_NATIVE_TOKEN_LOCK_FD, lockPath);
  const descriptor = acquire ? undefined : Number(env.SIA_NATIVE_TOKEN_LOCK_FD);
  const log = privateLogPath
    ? openSync(
        privateLogPath,
        constants.O_WRONLY |
          constants.O_CREAT |
          constants.O_EXCL |
          constants.O_NOFOLLOW,
        0o600,
      )
    : undefined;
  return new Promise((resolve, reject) => {
    const child = spawn(
      "python3",
      [
        "-c",
        guardianProgram,
        JSON.stringify({
          acquire,
          command: [command, ...args],
          deadlineMs,
          graceMs,
          lockPath,
          manifestPath: env.SIA_NATIVE_TOKEN_MANIFEST,
        }),
      ],
      {
        cwd,
        env: { ...env, ...(acquire ? {} : { SIA_NATIVE_TOKEN_LOCK_FD: "3" }) },
        stdio: acquire
          ? log === undefined
            ? "inherit"
            : ["inherit", "pipe", "pipe"]
          : [
              "inherit",
              log === undefined ? "inherit" : "pipe",
              log === undefined ? "inherit" : "pipe",
              descriptor,
            ],
      },
    );
    let bytes = 0,
      failed = false;
    /** @param {Buffer} chunk */
    const capture = (chunk) => {
      if (failed || log === undefined) return;
      const remaining = 8 * 1024 * 1024 - bytes;
      try {
        const accepted = chunk.subarray(0, remaining);
        let offset = 0;
        while (offset < accepted.length)
          offset += writeSync(log, accepted, offset);
        bytes += accepted.length;
        if (accepted.length !== chunk.length) failed = true;
      } catch {
        failed = true;
      }
      // Interrupt the guardian, not its SDK child: it keeps the lease through descendant reaping.
      if (failed) child.kill("SIGTERM");
    };
    child.stdout?.on("data", capture);
    child.stderr?.on("data", capture);
    child.once("error", reject);
    // Close follows pipe drainage; exit alone can discard the last diagnostic bytes.
    child.once("close", (code, signal) => {
      if (log !== undefined) {
        try {
          closeSync(log);
        } catch {
          failed = true;
        }
      }
      resolve(failed || signal ? 1 : (code ?? 1));
    });
  });
}
/** Verify the locked open file description, never an environment flag or PID claim.
 * @param {string | undefined} descriptor @param {string} lockPath
 */
export async function verifyNativeLease(descriptor, lockPath) {
  if (
    !descriptor ||
    !/^\d+$/.test(descriptor) ||
    !Number.isSafeInteger(Number(descriptor)) ||
    Number(descriptor) < 3
  )
    throw new Error("Missing inherited lease");
  const information = await readFile(`/proc/self/fdinfo/${descriptor}`, "utf8");
  const [held, expected] = await Promise.all([
    stat(`/proc/self/fd/${descriptor}`),
    stat(lockPath),
  ]);
  if (
    !/lock:\s+\d+:\s+FLOCK\s+ADVISORY\s+WRITE/.test(information) ||
    held.dev !== expected.dev ||
    held.ino !== expected.ino
  )
    throw new Error("Invalid inherited lease");
  return true;
}

/** Process pools close extra fds; verify their kernel ancestry to our still-locked guardian.
 * @param {string} lockPath
 */
export async function verifyOwnedGuardian(lockPath) {
  const expected = await stat(lockPath);
  /** @type {{pid: number, parent: number, started: string}[]} */
  const chain = [];
  let pid = process.pid;
  while (pid > 1 && chain.length < 64) {
    const identity = await processIdentity(pid);
    if (chain.some((item) => item.pid === pid))
      throw new Error("Invalid guardian ancestry");
    chain.push(identity);
    for (const descriptor of await readdir(`/proc/${pid}/fdinfo`)) {
      let info;
      try {
        info = await readFile(`/proc/${pid}/fdinfo/${descriptor}`, "utf8");
      } catch {
        continue;
      }
      if (!/lock:\s+\d+:\s+FLOCK\s+ADVISORY\s+WRITE/.test(info)) continue;
      const held = await stat(`/proc/${pid}/fd/${descriptor}`);
      if (held.dev !== expected.dev || held.ino !== expected.ino) continue;
      const args = (await readFile(`/proc/${pid}/cmdline`, "utf8")).split("\0");
      if (args[1] !== "-c" || args[2] !== guardianProgram) continue;
      const spec = /** @type {unknown} */ (JSON.parse(args[3] ?? "null"));
      if (
        !spec ||
        typeof spec !== "object" ||
        !("acquire" in spec) ||
        spec.acquire !== true ||
        !("lockPath" in spec) ||
        spec.lockPath !== lockPath
      )
        continue;
      for (const ancestor of chain) {
        if (
          JSON.stringify(await processIdentity(ancestor.pid)) !==
          JSON.stringify(ancestor)
        )
          throw new Error("Guardian ancestry changed");
      }
      const final = await stat(`/proc/${pid}/fd/${descriptor}`);
      if (
        final.dev !== expected.dev ||
        final.ino !== expected.ino ||
        !/lock:\s+\d+:\s+FLOCK\s+ADVISORY\s+WRITE/.test(
          await readFile(`/proc/${pid}/fdinfo/${descriptor}`, "utf8"),
        )
      )
        throw new Error("Guardian lease changed");
      return true;
    }
    pid = identity.parent;
  }
  throw new Error("No locked owning guardian");
}

/** @param {number} pid */
async function processIdentity(pid) {
  const text = await readFile(`/proc/${pid}/stat`, "utf8");
  const fields = text
    .slice(text.lastIndexOf(")") + 2)
    .trim()
    .split(/\s+/);
  if (!fields[19] || !fields[1] || !/^\d+$/.test(fields[1]))
    throw new Error("Invalid process identity");
  return { parent: Number(fields[1]), pid, started: fields[19] };
}
