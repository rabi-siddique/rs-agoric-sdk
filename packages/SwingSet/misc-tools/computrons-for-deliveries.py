import sys, json, gzip, re, time
from collections import defaultdict
from pprint import pprint

# Find all deliveries of a certain type and emit a histogram of how
# many computrons they took. If the delivery is supposed to take
# constant time, this might reveal JS-level growth (e.g. `serialize()`
# taking longer because the data it is working with is growing).

# You'll need to edit this file to change the selection criteria.

fn = sys.argv[1]
vatID = "v7"
ko = None # "ko258"
method = "serialize"

crankNum = None

print("crankNum,computrons")

opener = gzip.open if fn.endswith(".gz") else open
with opener(sys.argv[1]) as f:
    for line in f:
        if isinstance(line, bytes):
            line = line.decode("utf-8")
        if not line.strip():
            continue

        data = json.loads(line.strip())
        type = data["type"]
        when = data["time"]

        if type == 'deliver':
            if vatID and data["vatID"] != vatID:
                continue
            kd = data["kd"]
            if kd[0] == "message":
                target = kd[1]
                if ko and target != ko:
                    continue
                msg = kd[2]
                methargsCD = msg["methargs"]
                result = msg["result"]
                if method and method != json.loads(methargsCD["body"])[0]:
                    continue
                crankNum = data["crankNum"] # want this one
            #elif kd[0] == "notify":
            #    method = "(notify)"
            #    start = when
        if crankNum is not None and type == 'deliver-result' and data["crankNum"] == crankNum:
            computrons = data["dr"][2]["compute"]
            print("%d,%d" % (crankNum,computrons))
            crankNum = None

