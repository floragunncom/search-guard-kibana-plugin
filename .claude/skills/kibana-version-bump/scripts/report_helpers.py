#!/usr/bin/env python3
"""JSON formatting helpers for so_index_check.sh and log_report.sh (stdin = Elasticsearch response)."""
import json
import sys


def load():
    try:
        return json.load(sys.stdin)
    except Exception as e:  # noqa: BLE001
        print(f"(not JSON: {e})")
        sys.exit(0)


def shape(src):
    out = {}
    for k, v in src.items():
        out[k] = {kk: type(vv).__name__ for kk, vv in v.items()} if isinstance(v, dict) else type(v).__name__
    return out


def main():
    cmd = sys.argv[1]
    d = load()
    if "error" in d:
        print("(query error:", json.dumps(d["error"])[:200], ")")
        return
    if cmd == "types":
        buckets = d.get("aggregations", {}).get("t", {}).get("buckets", [])
        print(", ".join(f"{b['key']}:{b['doc_count']}" for b in buckets) or "(no docs)")
    elif cmd == "tenant-docs":
        tenant = sys.argv[2]
        hits = d["hits"]["hits"]
        print(f"{d['hits']['total']['value']} docs with an sg_tenant field (expect > 0 after runtime_check.sh)")
        bad = [h for h in hits if "__sg_ten__" not in h["_id"]]
        for h in hits[:25]:
            print(f"  {h['_index']:40s} {h['_id']:70s} type={h['_source'].get('type')} sg_tenant={h['_source'].get('sg_tenant')}")
        print("ids without the __sg_ten__ suffix (expect 0):", len(bad))
        print("test tenant present:", any(tenant.replace('_', '') in h["_id"] for h in hits))
    elif cmd == "space-diff":
        hits = d["hits"]["hits"]
        kib = [h for h in hits if h["_id"] == "space:default"]
        ten = [h for h in hits if h["_id"] != "space:default"]
        if kib:
            print("Kibana space:default fields :", json.dumps(shape(kib[0]["_source"]), sort_keys=True))
        for h in ten:
            print(f"tenant {h['_id']} fields:", json.dumps(shape(h["_source"]), sort_keys=True))
        if kib and ten:
            a, b = shape(kib[0]["_source"]), shape(ten[0]["_source"])
            diff = {k: (a.get(k), b.get(k)) for k in set(a) | set(b) if a.get(k) != b.get(k)}
            print("DIFFERENCES (expect only sg_tenant, which Search Guard adds):", json.dumps(diff, sort_keys=True) if diff else "none")
        else:
            print("(need both Kibana's default space and a tenant space doc; switch to a tenant via the API first)")
    elif cmd == "tenant-counts":
        buckets = d.get("aggregations", {}).get("t", {}).get("buckets", [])
        print("\n".join(f"{b['key']} {b['doc_count']}" for b in buckets) or "(none)")
    elif cmd == "audit":
        print(f"{d['hits']['total']['value']} MISSING_PRIVILEGES events")
        for u in d["aggregations"]["u"]["buckets"]:
            for p in u["p"]["buckets"]:
                idx = ", ".join(b["key"] for b in p["i"]["buckets"]) or "-"
                print(f"  {u['key']:20s} {p['key']:50s} {p['doc_count']:5d}  indices: {idx}")


if __name__ == "__main__":
    main()
