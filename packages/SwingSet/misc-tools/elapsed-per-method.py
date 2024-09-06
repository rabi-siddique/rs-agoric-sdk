import sys, json, gzip, re, time
from collections import defaultdict
from pprint import pprint

# Given a slogfile, for each method name, report the number of times
# that message was delivered into a vat, the total time/computrons
# spent on those kinds of deliveries, and the average time per
# delivery.

fn = sys.argv[1]
vatID = sys.argv[2] if len(sys.argv) > 2 else None

start = None
method = None
deliveries = defaultdict(lambda: (0, 0.0, computrons)) # of (count, elapsed, computrons)
total_time = 0.0
total_computrons = 0

opener = gzip.open if fn.endswith(".gz") else open
with opener(sys.argv[1]) as f:
    for line in f:
        if isinstance(line, bytes):
            line = line.decode("utf-8")
        if not line.strip():
            continue

        data = json.loads(line.strip())
        if vatID and data.get("vatID") != vatID:
            continue
        type = data["type"]
        when = data["time"]

        if type == 'deliver':
            vd = data["vd"]
            if vd[0] == "message":
                target = vd[1]
                msg = vd[2]
                methargsCD = msg["methargs"]
                result = msg["result"]
                methodobj = json.loads(methargsCD["body"])[0]
                if isinstance(methodobj, str):
                    method = methodobj
                elif isinstance(methodobj, dict) and methodobj["@qclass"] == "symbol":
                    method = methodobj["name"]
                else:
                    raise ValueError("cannot determine method of %s" % json.dumps(methodobj))
                start = when
            elif vd[0] == "notify":
                method = "(notify)"
                start = when
        if type == 'deliver-result':
            if start is not None:
                elapsed = when - start
                computrons = data["dr"][2]["compute"]
                (old_count, old_elapsed, old_computrons) = deliveries[method]
                new_count = old_count + 1
                new_elapsed = old_elapsed + elapsed
                total_time += elapsed
                new_computrons = old_computrons + computrons
                total_computrons += computrons
                deliveries[method] = (new_count, new_elapsed, new_computrons)
                start = None
                method = None


print("| count| method                         | total computrons | total time |  avg each |")
print("| ---- | ------------------------------ | ---------------- | ---------- | --------- |")
for method in sorted(deliveries, key=lambda method: deliveries[method][1], reverse=True):
    (count, elapsed, computrons) = deliveries[method]
    avg = elapsed / count
    print("| {:3d}x | {:>28} s | {:>16_d} |    {:2.3f} s |   {:.3f} s |".format(count, method, computrons, elapsed, avg))
print("total: {:2.3f} s, {:_d} computrons".format(total_time, total_computrons))
