#
# Given a slogfile on stdin and a vatID, this emits a CSV of every
# delivery (including BOYD and GC actions), with their wallclock time
# and computrons (if any). This can be turned into a scatter chart
# which might show trends like organic GC taking longer over time. It
# ignores replays.

import sys, json
from collections import defaultdict
from itertools import count

cranks = [] # (deliveryNum, wallclock, computrons)
deliveryNum = None
start = None
summary = None

vatID = sys.argv[1]

print("crankNum,deliveryNum,elapsed,computrons")
for line in sys.stdin:
    d = json.loads(line)
    time = d["time"]
    stype = d["type"]
    if d.get("vatID") != vatID:
        continue
    if stype == "deliver" and not d["replay"]:
        crankNum = d["crankNum"]
        deliveryNum = d["deliveryNum"]
        start = time
    if stype and deliveryNum is not None and stype == "deliver-result" and not d["replay"]:
        elapsed = time - start
        computrons = d["dr"][2]["compute"]
        print("%s,%s,%s,%s" % (crankNum, deliveryNum, elapsed, computrons))
        deliveryNum = None
