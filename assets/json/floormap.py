import os
from json import load, dumps

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def getType(data: dict) -> str:
    return data['type']


def getEvent(data: dict) -> dict:
    return {'id': data['id'], 'events': data['event']}


def getDefault(data: dict) -> dict:
    return {key: data[key] for key in data.keys() if key not in ['event', 'tag']}


def getBoothPos(data: dict) -> dict:
    return {key: data[key] for key in data.keys() if key in ['floor', 'w', 'h', 'x', 'y', 'p', 'id']}


def getBoothInfo(data: dict) -> dict:
    return {key: data[key] for key in data.keys() if key in ['id', 'size', 'cat', 'topic', 'tag', 'text', 'corps']}


os.makedirs('2023', exist_ok=True)
with open('floormap.json', 'r', encoding='utf-8') as f:
    floormap = load(f)
    types = {getType(data) for data in floormap}
    events = [getEvent(data) for data in floormap if 'event' in data.keys() and 'booth' == data['type']]
    default = [getDefault(data) for data in floormap if data['type'] in ['icon', 'wall', 'room', 'pillar']]
    defaultTexts = [data for data in floormap if data['type'] == 'text' and data['text']['tc'][0] in ['I', 'J', 'K', 'L', 'M', 'N']]
    booth = [data for data in floormap if data['type'] not in ['icon', 'wall', 'room', 'pillar'] or (data['type'] == 'text' and data['text']['tc'][0] not in ['I', 'J', 'K', 'L', 'M', 'N'])]
    minify = (',', ':')
    open('2023/events.json', 'w').write(dumps(events, ensure_ascii=False, separators=minify))
    open('2023/boothInfo.json', 'w').write(dumps([getBoothInfo(data) for data in floormap if 'booth' == data['type']], ensure_ascii=False, separators=minify))
    open('elems.json', 'w').write(dumps(default+defaultTexts, ensure_ascii=False, separators=minify))
    open('boothPos.json', 'w').write(dumps([getBoothPos(data) for data in floormap if 'booth' == data['type']], ensure_ascii=False, separators=minify))
    open('2023/booth.json', 'w').write(dumps(booth, ensure_ascii=False, separators=minify))
