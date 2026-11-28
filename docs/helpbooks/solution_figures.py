"""(Authoring helper, kept for reference.) Compact constructors for solution pictures of help-book questions.
put(cls, key, figs, after=None): stores figs (list) for "<chapter>-<label>"; `after` is text of the solution line
after which the pictures go (default: before the final "So, …" paragraph)."""
import json, os, re
WEB = "/home/user/ctai-platform/web/prisma/content/helpbook/solutions"
_store = {}
def _load(c):
    if c not in _store:
        p = f"{WEB}/figs-c{c}.json"
        _store[c] = json.load(open(p)) if os.path.exists(p) else {}
    return _store[c]
def put(c, key, figs, after=None):
    sol = json.load(open(f"{WEB}/c{c}.json"))
    assert key in sol, (c, key)
    if not isinstance(figs, list): figs = [figs]
    if after: assert after in sol[key], (c, key, after)
    d = _load(c); d[key] = {"figs": figs, **({"after": after} if after else {})}
def save():
    for c, d in _store.items():
        json.dump(dict(sorted(d.items(), key=lambda kv: (int(kv[0].split("-")[0]), kv[0].split("-")[1].rjust(4)))), open(f"{WEB}/figs-c{c}.json", "w"), ensure_ascii=False, indent=0)
    print({c: len(d) for c, d in _store.items()})
def nl(mn, mx, step=1, every=None, marks=(), jumps=None, alt="Number line", dec=None):
    f = {"kind": "numberline", "min": mn, "max": mx, "step": step, "labelEvery": max(1, round((every or step) / step)), "marks": [{"v": v, "label": l, "colour": c} for v, l, c in marks], "alt": alt}
    if jumps: f["jumps"] = dict(zip(["from", "size", "count", "colour", "icon"], jumps)); f["jumps"].setdefault("colour", "orange")
    if dec is not None: f["decimals"] = dec
    return f
def clock(h, m, alt=None): return {"kind": "clock", "h": h, "m": m, "alt": alt or f"A clock showing {h}:{m:02d}"}
def cal(month, start, days, marks, alt="Calendar"): return {"kind": "calendar", "month": month, "start": start, "days": days, "marks": [{"d": d, "colour": c} for d, c in marks], "alt": alt}
def money(items, alt="Notes and coins"): return {"kind": "money", "items": items, "alt": alt}
def balance(icon, n, right, unit, alt="A balanced scale"): return {"kind": "balance", "left": {"icon": icon, "n": n}, "right": right, "unit": unit, "alt": alt}
def bars(title, labels, values, step, alt=None, show=True): return {"kind": "bars", "title": title, "labels": labels, "values": values, "step": step, "showValues": show, "alt": alt or title}
def frac(parts, shaded, shape="circle", colour="orange", rows=None, alt=None):
    if isinstance(rows, str): rows, alt = None, rows
    f = {"kind": "fraction", "shape": shape, "parts": parts, "shaded": shaded, "colour": colour, "alt": alt or f"{shaded} of {parts} parts shaded"}
    if rows: f["rows"] = rows
    return f
def beads(cols, alt="Beads"): return {"kind": "beads", "colours": cols, "alt": alt}
def numgrid(a, b, cols, marks, alt="Number grid"): return {"kind": "numgrid", "from": a, "to": b, "cols": cols, "marks": [{"v": v, "colour": c} for v, c in marks], "alt": alt}
def sticks(n, alt=None): return {"kind": "matchsticks", "squares": n, "alt": alt or f"{n} squares in a row"}
def area(h, widths, labels, hl, alt="Area model"): return {"kind": "areamodel", "height": h, "widths": widths, "labels": labels, "hLabel": hl, "alt": alt}
def binary(bits, alt=None): return {"kind": "binary", "bits": bits, "alt": alt or "Binary cards " + "".join(map(str, bits))}
def venn(l, r, a, both, b, out=None, alt="Venn diagram"):
    f = {"kind": "venn", "left": l, "right": r, "a": str(a), "both": str(both), "b": str(b), "alt": alt}
    if out is not None: f["outside"] = str(out)
    return f
def grid(rows, colour="blue", alt="Grid"): return {"kind": "lettergrid", "rows": rows, "colour": colour, "alt": alt}
def gmap(rows, cols, items, path=None, compass=False, alt="Map"):
    f = {"kind": "gridmap", "rows": rows, "cols": cols, "items": [{"r": r, "c": c, "icon": i} for r, c, i in items], "alt": alt}
    if path: f["path"] = path
    if compass: f["compass"] = True
    return f
def icons(items, cols, alt="Pictures"): return {"kind": "icons", "items": [{"icon": i, **({"mark": m} if m else {})} for i, m in [(x if isinstance(x, tuple) else (x, None)) for x in items]], "cols": cols, "alt": alt}
def cubes(heights, colour="blue", alt="Towers of cubes"): return {"kind": "cubes", "heights": heights, "colour": colour, "alt": alt}
def abacus(labels, beads_, alt="Abacus"): return {"kind": "abacus", "labels": labels, "beads": beads_, "alt": alt}
def jug(mx, step, every, level, unit="mL", alt=None): return {"kind": "jug", "max": mx, "step": step, "labelEvery": max(1, round(every / step)), "level": level, "unit": unit, "alt": alt or f"{level} {unit}"}
def ruler(cm, start, length, colour="orange", alt=None): return {"kind": "ruler", "cm": cm, "start": start, "length": length, "colour": colour, "alt": alt or f"{length} cm"}
def seq(frames, alt="Steps"): return {"kind": "sequence", "frames": frames, "alt": alt}
def arrow(d, colour="blue"): return {"kind": "arrow", "dir": d, "colour": colour, "alt": ["Up", "Right", "Down", "Left"][d]}
def dots(n, colour="blue", shape="circle"): return {"kind": "dots", "count": n, "colour": colour, "shape": shape, "alt": f"{n} dots"}
def picto(title, labels, counts, icon, per, alt=None): return {"kind": "pictograph", "title": title, "labels": labels, "counts": counts, "icon": icon, "per": per, "alt": alt or title}
def angle(deg, colour="blue"): return {"kind": "angle", "deg": deg, "colour": colour, "alt": f"{deg}° angle"}
def pix(n, cells, mirror=None, alt="Grid"):
    f = {"kind": "pixels", "n": n, "cells": [list(c) for c in cells], "alt": alt}
    if mirror: f["mirror"] = mirror
    return f
def lines(segs, colour="blue", mono=False, alt="Lines"):
    f = {"kind": "lines", "segs": segs, "colour": colour, "alt": alt}
    if mono: f["mono"] = True
    return f
def shapes(cols, rows, items, alt="Shapes"): return {"kind": "shapes", "cols": cols, "rows": rows, "items": [{"r": r, "c": c, "shape": s, "colour": k} for r, c, s, k in items], "alt": alt}
