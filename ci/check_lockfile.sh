#!/bin/bash
#
# Supply chain check for yarn.lock (yarn 1 format). Reads the file as text:
# no install, no network.
#
# Every entry must
#   - be resolved from the npm registry (registry.yarnpkg.com or
#     registry.npmjs.org, the same registry under two names), and
#   - carry an integrity hash (sha256, sha384 or sha512).
#
# A dependency fetched from a git repository, a tarball URL or another host
# fails the check, and so does an entry whose hash was removed. That is how
# a package can enter the build without ever being published to the registry.
#
# Legitimate cases (for example a fork pinned to a git commit) go into ci/yarn-lock-exceptions.txt, in the same merge request that changes
# yarn.lock, so the exception is reviewed together with the change.
#
# Usage: ci/check_lockfile.sh [path/to/yarn.lock] [path/to/exceptions-file]

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOCKFILE="${1:-$SCRIPT_DIR/../yarn.lock}"
EXCEPTIONS="${2:-$SCRIPT_DIR/yarn-lock-exceptions.txt}"

if [[ ! -f "$LOCKFILE" ]]; then
   echo "ERROR: lockfile not found: $LOCKFILE"
   exit 1
fi

awk -v exceptions_file="$EXCEPTIONS" '
function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t\r]+$/, "", s); return s }
function unquote(s) { gsub(/"/, "", s); return s }

function fail(msg) { errors[++error_count] = msg }

# Checks the entry collected so far and resets the state for the next one.
function flush_entry(   key, i, ok) {
   if (name == "") return
   entry_count++
   key = name "@" version
   if (key in package_exception) {
      package_exception_used[key] = 1
      excepted_count++
   } else {
      if (resolved == "") {
         fail(key ": no resolved URL")
      } else {
         ok = 0
         for (i = 1; i <= registry_count; i++) {
            if (index(resolved, registry[i]) == 1) ok = 1
         }
         if (!ok) fail(key ": resolved from " resolved)
      }
      if (integrity == "") {
         fail(key ": no integrity hash")
      } else if (integrity !~ /^sha(256|384|512)-/) {
         fail(key ": weak integrity hash (" integrity "): replace it with the sha512 value from `npm view " key " dist.integrity`")
      }
   }
   name = ""; version = ""; resolved = ""; integrity = ""
}

BEGIN {
   registry[++registry_count] = "https://registry.yarnpkg.com/"
   registry[++registry_count] = "https://registry.npmjs.org/"

   # Exceptions file: see the header of ci/yarn-lock-exceptions.txt.
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

# Comments and blank lines.
/^#/ || /^[ \t\r]*$/ { next }

# Entry header, not indented, for example:
#   dompurify@^3.4.16:
#   "@types/react@*", "@types/react@^18":
/^[^ \t]/ {
   flush_entry()
   spec = $0
   sub(/:[ \t\r]*$/, "", spec)
   sub(/,.*/, "", spec)
   spec = unquote(trim(spec))
   # Drop the version range: everything from the last "@" on. A scoped name
   # (@scope/name) starts with "@", which is never the last one.
   at = 0
   for (i = length(spec); i > 1; i--) { if (substr(spec, i, 1) == "@") { at = i; break } }
   name = (at > 0) ? substr(spec, 1, at - 1) : spec
   next
}

/^  version / { version = unquote($2); next }
/^  resolved / { resolved = unquote($2); next }
/^  integrity / { integrity = $2; next }

END {
   flush_entry()

   if (entry_count == 0) fail("no entries found: is this a yarn 1 lockfile?")

   # Stale exceptions are reported but do not fail the build.
   for (key in package_exception) {
      if (!(key in package_exception_used)) {
         print "WARNING: unused exception in " exceptions_file ":" package_exception[key] ": package " key " is not in the lockfile, remove it"
      }
   }

   if (error_count > 0) {
      print "ERROR: yarn.lock check failed (" error_count " problem(s)):"
      for (i = 1; i <= error_count; i++) print "  - " errors[i]
      print ""
      print "If this is intended, add an exception with a reason to ci/yarn-lock-exceptions.txt"
      print "in the same merge request. If it is not, do not merge: find out how it got there."
      exit 1
   }

   printf "yarn.lock check passed: %d entries", entry_count
   if (excepted_count > 0) printf ", %d covered by an exception", excepted_count
   print ""
}
' "$LOCKFILE"
