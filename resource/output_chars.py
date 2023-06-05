from os import listdir
from os.path import isfile
import json

onlyfiles = [f for f in listdir('.') if isfile(f)]

char_json = []

for file in onlyfiles:
    if file.endswith('.webp'):
        char_name = file.replace('_Icon.webp', '').replace('_', '-').lower()
        char = {
            'name': char_name,
            'star_rarity': 4,
            'region': 'none',
            'icon': file,
            'alt_icons': [],
            'element': ''
        }
        char_json.append(char)
        print(char)

with open('characters.json', 'w') as of:
    json.dump(char_json, of, indent=2)