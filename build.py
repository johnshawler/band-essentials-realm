#!/usr/bin/env python3
"""Assemble index.html from the parts in src/. Run: python3 build.py"""
import os
d = os.path.dirname(os.path.abspath(__file__))
s = lambda n: open(os.path.join(d, 'src', n), encoding='utf-8').read()
head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n')
# the chapters carry every unit's notes and fingerings (units-data.json, made by src/gen-units.py from the staging repo)
chapters = s('chapters.js').replace('/*UNITS_DATA*/[]', s('units-data.json').strip())
page = head + s('realm-head.html') + s('kits.js') + chapters + '\n' + s('scene-tree.js') + '\n' + s('scene-light.js') + '\n' + s('realm-game.js') + '\n' + s('realm-play.js') + '\n' + s('realm-tail.js') + '\n</body>\n</html>\n'
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page)
print('wrote index.html', len(page), 'bytes')
