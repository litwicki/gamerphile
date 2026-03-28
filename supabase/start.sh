#!/usr/bin/env bash
# Start Supabase with dynamic port allocation.
# If any configured port is already in use, finds the next available port.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/config.toml"

python3 - "$CONFIG" <<'PYEOF'
import sys, re, socket

config_path = sys.argv[1]

def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_free_port(start):
    port = start
    while port_in_use(port):
        port += 1
    return port

with open(config_path) as f:
    content = f.read()

def replace_port(m):
    prefix = m.group(1)
    old_port = int(m.group(2))
    new_port = find_free_port(old_port)
    if new_port != old_port:
        print(f"  port {old_port} in use, reassigning to {new_port}", file=sys.stderr)
    return f"{prefix}{new_port}"

# Match port/shadow_port/inspector_port assignments (not commented lines)
new_content = re.sub(
    r'^((?:shadow_|inspector_)?port\s*=\s*)(\d+)',
    replace_port,
    content,
    flags=re.MULTILINE
)

with open(config_path, 'w') as f:
    f.write(new_content)

print("Port check complete.", file=sys.stderr)
PYEOF

supabase start
