import sys, gzip, json

fn = sys.argv[1]
start = sys.argv[2]
if start == "bootstrap":
    end = 1
else:
    start = int(start)
    end = start
    if len(sys.argv) > 3:
        end = int(sys.argv[3])
yes = False

opener = gzip.open if fn.endswith(".gz") else open
with opener(sys.argv[1]) as f:
    for line in f:
        if isinstance(line, bytes):
            line = line.decode("utf-8")
        data = json.loads(line.strip())
        type = data["type"]
        if start == "bootstrap" and type == "cosmic-swingset-bootstrap-block-start":
            yes = True
        if start != "bootstrap" and type == "cosmic-swingset-begin-block" and data["blockHeight"] == start:
            yes = True
        if yes:
            sys.stdout.write(line)
        if start == "bootstrap" and type == "cosmic-swingset-bootstrap-block-finish":
            break
        if type == "cosmic-swingset-end-block-finish" and data["blockHeight"] == end:
            break
