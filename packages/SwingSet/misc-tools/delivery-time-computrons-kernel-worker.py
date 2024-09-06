#
# Given a slogfile on stdin and a vatID, this emits a CSV of every
# delivery (including BOYD and GC actions), with their wallclock time,
# computrons (if any), and how much wallclock time was spent in the
# worker, vs in the kernel (syscalls). This can be turned into a
# scatter chart which might show trends like organic GC taking longer
# over time. It ignores replays.

import sys
from parse_timestamps import stream_file

fn = sys.argv[1]
vatID = sys.argv[2]

print("blockHeight,blockTime,tx_delivery,crankNum,deliveryNum,total,worker,kernel,pipe,computrons")
for d in stream_file(fn, vatID):
    print("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s" % (d.blockheight, d.blocktime, d.tx_delivery,
                                    d.cranknum, d.deliverynum,
                                    d.k_to_k, d.total_worker, d.total_kernel, d.total_pipe,
                                    d.computrons or 0))

