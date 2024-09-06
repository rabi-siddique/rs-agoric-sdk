import csv
import sys
import itertools
import statistics

SIZE = 1000

print("first_cranknum,deliver_median,gc_p10,gc_p50,gc_p90")
out = []
with open(sys.argv[1]) as f:
    r = csv.reader(f)
    headers = next(r)
    while True:
        rows = list(itertools.islice(r, 0, SIZE))
        cranknums = [int(row[0]) for row in rows]
        if len(cranknums) < SIZE:
            break
        deliver_monotimes = [float(row[1]) for row in rows]
        deliver_median = statistics.quantiles(deliver_monotimes, n=2)[0]
        gc_times = [float(row[2]) for row in rows]
        quantiles = statistics.quantiles(gc_times, n=10)
        p10 = quantiles[0]
        p50 = quantiles[4]
        p90 = quantiles[8]
        print("%d,%f,%f,%f,%f" % (cranknums[0],deliver_median,p10,p50,p90))
