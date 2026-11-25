# Builds units-data.json: for every instrument, the notes each course unit (level 1-12) adds and the fingerings for all of them.
# Notes come from each instrument's fingering data (staging-tools/fingerings/<key>.json, playNoteNames); family and clef are
# kept from level1-data.json so Chapter 1 is unchanged. Usage: python3 -I gen-units.py <staging repo> <out.json>
import json, os, re, sys

repo, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
old = {i['key']: i for i in json.load(open(os.path.join(here, 'level1-data.json')))}
L = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

def midi(n):
    m = re.fullmatch(r'([A-G])(#|b)?(-?\d)', n)
    return 12 * (int(m.group(3)) + 1) + L[m.group(1)] + {'#': 1, 'b': -1, None: 0}[m.group(2)]

# the keys each fingering layout in the game shows (realm-play.js LAYOUTS); a fingering that needs any other key is reported
SHOWN = {'sax': {21, 20, 19, 18, 17, 16, 3, 12}, 'clarinet': {4, 6, 7, 13, 17, 18, 3, 5, 1, 2, 15, 22}, 'flute': {12, 11, 10, 9, 8, 7, 13, 1, 6}, 'valves': {1, 2, 3, 4}}

res = []
for key, o in old.items():
    d = json.load(open(f'{repo}/staging-tools/fingerings/{key}.json'))
    levels = []
    for lv in sorted(d['playNoteNames'], key=int):
        if int(lv) > 12: continue
        m = re.search(r'\(([^)]*)\)', d['playNoteNames'][lv])
        levels.append([x.strip() for x in m.group(1).split(',')])
    # saxes share written fingerings, so the tenor (whose own chart is empty) reads the alto chart, as Chapter 1 does
    chart = d['fingerings'] or (json.load(open(f'{repo}/staging-tools/fingerings/saxophone.json'))['fingerings'] if o['family'] == 'sax' else [])
    fam, fmap, fing = o['family'], {f['midi']: f['fingering'] for f in chart}, {}
    for u, notes in enumerate(levels, 1):
        for n in notes:
            mm = midi(n)
            if not fam: continue
            if mm not in fmap: print(f'MISSING unit {u} {key} {n}', file=sys.stderr); continue
            fing[mm] = fmap[mm]
            if fam in SHOWN:
                extra = [b for b in range(32) if fmap[mm] >> b & 1 and b not in SHOWN[fam]]
                if extra: print(f'HIDDEN KEYS unit {u} {key} {n} bits {extra}', file=sys.stderr)
    assert levels[0] == o['notes'], (key, levels[0], o['notes'])
    res.append({'key': key, 'name': o['name'], 'clef': o['clef'], 'family': fam, 'units': levels, 'fing': fing})

json.dump(res, open(out, 'w'), separators=(',', ':'))
print('wrote', out, os.path.getsize(out), 'bytes')
