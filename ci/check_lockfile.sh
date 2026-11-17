#!/bin/bash
#
# Supply chain check for pnpm-lock.yaml (lockfile version 9). Reads the file
# as text: no install, no network.
#
# Every package entry must have a resolution that consists of an integrity
# hash only (sha256, sha384 or sha512). That is what an entry from the npm
# registry looks like. A dependency fetched from a git repository or a tarball
# URL has a resolution with `tarball`, `repo` or `commit` instead, and fails
# the check.
#
# pnpm itself refuses such dependencies when they are dependencies of
# dependencies (blockExoticSubdeps in pnpm-workspace.yaml). This check also
# covers direct ones and works without running pnpm.
#
# Legitimate cases (for example a fork pinned to a git commit) go into
# ci/lockfile-exceptions.txt, in the same merge request that changes the
# lockfile, so the exception is reviewed together with the change.
#
# Usage: ci/check_lockfile.sh [path/to/pnpm-lock.yaml] [path/to/exceptions-file]

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOCKFILE="${1:-$SCRIPT_DIR/../pnpm-lock.yaml}"
EXCEPTIONS="${2:-$SCRIPT_DIR/lockfile-exceptions.txt}"

if [[ ! -f "$LOCKFILE" ]]; then
   echo "ERROR: lockfile not found: $LOCKFILE"
   exit 1
fi

awk -v exceptions_file="$EXCEPTIONS" '
function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t\r]+$/, "", s); return s }

function fail(msg) { errors[++error_count] = msg }

# Checks the entry collected so far and resets the state for the next one.
function flush_entry() {
   if (key == "") return
   entry_count++
   if (key in package_exception) {
      package_exception_used[key] = 1
      excepted_count++
   } else if (resolution == "") {
      fail(key ": no resolution")
   } else if (resolution !~ /^\{integrity: sha(256|384|512)-[A-Za-z0-9+\/=]+\}$/) {
      fail(key ": not a plain registry entry with a strong hash: " resolution)
   }
   key = ""; resolution = ""
}

BEGIN {
   # Exceptions file: see the header of ci/lockfile-exceptions.txt.
   line_no = 0
   while ((getline line < exceptions_file) > 0) {
      line_no++
      reason = ""
      hash = index(line, "#")
      if (hash > 0) { reason = trim(substr(line, hash + 1)); line = substr(line, 1, hash - 1) }
      line = trim(line)
      if (line == "") continue
      n = split(line, parts, /[ \t]+/)
      if (n != 2 || parts[1] != "package") {
         fail(exceptions_file ":" line_no ": expected \"package <name>@<version>  # reason\"")
         continue
      }
      if (reason == "") {
         fail(exceptions_file ":" line_no ": exception without a reason (add \"# why\" at the end of the line)")
         continue
      }
      package_exception[parts[2]] = line_no
   }
   close(exceptions_file)
}

/^lockfileVersion:/ { lockfile_version = $2; gsub(/\047/, "", lockfile_version) }

# Top-level sections. Only `packages:` holds the downloaded packages.
/^[A-Za-z]/ { flush_entry(); in_packages = ($1 == "packages:"); next }

!in_packages { next }

# Entry header, two spaces deep, for example:
#   dompurify@3.4.16:
#   "@types/react@18.3.1":   (pnpm writes these with single quotes)
/^  [^ ]/ {
   flush_entry()
   key = trim($0)
   sub(/:$/, "", key)
   gsub(/^\047|\047$/, "", key)
   next
}

/^    resolution: / { resolution = $0; sub(/^    resolution: /, "", resolution); resolution = trim(resolution); next }

END {
   flush_entry()

   if (lockfile_version !~ /^9\./) fail("unexpected lockfileVersion \"" lockfile_version "\": this check is written for version 9")
   if (entry_count == 0) fail("no entries found under packages:")

   # Stale exceptions are reported but do not fail the build.
   for (k in package_exception) {
      if (!(k in package_exception_used)) {
         print "WARNING: unused exception in " exceptions_file ":" package_exception[k] ": package " k " is not in the lockfile, remove it"
      }
   }

   if (error_count > 0) {
      print "ERROR: pnpm-lock.yaml check failed (" error_count " problem(s)):"
      for (i = 1; i <= error_count; i++) print "  - " errors[i]
      print ""
      print "If this is intended, add an exception with a reason to ci/lockfile-exceptions.txt"
      print "in the same merge request. If it is not, do not merge: find out how it got there."
      exit 1
   }

   printf "pnpm-lock.yaml check passed: %d entries", entry_count
   if (excepted_count > 0) printf ", %d covered by an exception", excepted_count
   print ""
}
' "$LOCKFILE"
