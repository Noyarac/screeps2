import requests
from cred import AUTH_DATA
from functools import reduce
from time import sleep
from tqdm import tqdm

SEASON = True
X_LETTER = "E"
X_BOUNDARIES = [36, 49]
Y_LETTER = "S"
Y_BOUNDARIES = [10, 30]

SHARD = "shard3"
if SEASON:
    IS_SEASON = "season/"
    SHARD = "shardSeason"
else:
    IS_SEASON = ""

response = requests.post('https://screeps.com/api/auth/signin', json=AUTH_DATA)
auth_token = response.json().get('token')
headers = {
    'X-Token': auth_token,
}


def get_room(roomName):
        global headers
        API_URL = f'https://screeps.com/{IS_SEASON}api/game/room-terrain?room={roomName}&shard={SHARD}'
        response = requests.get(API_URL, headers=headers)
        if response.status_code == 200:
            room = response.json()
            # headers = {
            #     'X-Token': response.headers._store["x-token"][1],
            # }
        else:
            print(f"Failed to retrieve market orders. Status code: {response.status_code}")
            room = None
        return room

def get_objects(roomName):
        global headers
        API_URL = f'https://screeps.com/{IS_SEASON}api/game/room-objects?room={roomName}&shard={SHARD}'
        response = requests.get(API_URL, headers=headers)
        if response.status_code == 200:
            objects = response.json()
            # headers = {
            #     'X-Token': response.headers._store["x-token"][1],
            # }
        else:
            print(f"Failed to retrieve market orders. Status code: {response.status_code}")
            objects = None
        return objects

HAUT = 0
DROITE = 1
BAS = 2
GAUCHE = 3
ORIENTATION = ["haut", "droit", "bas", "gauche"]

def have_enough_room_for_base(roomTerrain, objects, orientation):
    controllers = [{"x": object["x"], "y": object["y"]} for object in objects["objects"] if object["type"] == "controller"]
    # sources = [[object["x"], object["y"]] for object in objects["objects"] if object["type"] == "source"]

    if len(controllers) == 0:
        return False
    controller = controllers[0]
    if orientation == HAUT:
        if controller["x"] < 4 or controller["x"] > 45 or controller["y"] > 42:
            return False
        boundaries = [[-2, 2],[2, 6]]
        range_no_swamp_x = range(controller["x"] - 2, controller["x"] + 3)
        range_no_swamp_y = [controller["y"] + 4]
    elif orientation == DROITE:
        if controller["x"] < 7 or controller["y"] < 4 or controller["y"] > 45:
            return False
        boundaries = [[-6, -2],[-2, 2]]
        range_no_swamp_x = [controller["x"] - 4]
        range_no_swamp_y = range(controller["y"] - 2, controller["y"] + 3)
    elif orientation == BAS:
        if controller["x"] < 4 or controller["x"] > 45 or controller["y"] < 7:
            return False
        boundaries = [[-2, -6],[2, -2]]
        range_no_swamp_x = range(controller["x"] - 2, controller["x"] + 3)
        range_no_swamp_y = [controller["y"] - 4]
    elif orientation == GAUCHE:
        if controller["x"] > 42 or controller["y"] < 4 or controller["y"] > 45:
            return False
        boundaries = [[2, -2], [6, 2]]
        range_no_swamp_x = [controller["x"] + 4]
        range_no_swamp_y = range(controller["y"] - 2, controller["y"] + 3)

    range_x = range(controller["x"] + boundaries[0][0], controller["x"] + boundaries[1][0] + 1)
    range_y = range(controller["y"] + boundaries[0][1], controller["y"] + boundaries[1][1] + 1)
    
    for x, y, type in [(spot["x"], spot["y"], spot["type"]) for spot in roomTerrain["terrain"]]:
        if x in range_x and y in range_y:
            if type == "wall":
                return False
            if x in range_no_swamp_x and y in range_no_swamp_y and type == "swamp":
                return False
    return True
            
def get_viable_orientations(room_terrain, room_objects):
    orientations = []
    for orientation in [HAUT, BAS, GAUCHE, DROITE]:
        if have_enough_room_for_base(room_terrain, room_objects, orientation):
            orientations.append(orientation)
    return orientations

answers = []
for roomx in tqdm(range(X_BOUNDARIES[0], X_BOUNDARIES[1]), desc="Completion: "):
    for roomy in range(Y_BOUNDARIES[0], Y_BOUNDARIES[1]):
        sleep(0.5)
        room_name = f"{X_LETTER}{roomx}{Y_LETTER}{roomy}"
        room_terrain = get_room(room_name)
        room_objects = get_objects(room_name)

        controllers = [object for object in room_objects["objects"] if object["type"] == "controller"]
        if len(controllers) == 0:
            continue
        controller = controllers[0]
        if "user" in controller and controller["user"] != None:
            continue
        if "reservation" in controller and controller["reservation"] != None:
            continue

        sources = [{"x": object["x"], "y": object["y"]} for object in room_objects["objects"] if object["type"] == "source"]
        if len(sources) < 2:
            continue

        viable_orientations = get_viable_orientations(room_terrain, room_objects)
        for orientation in viable_orientations:
            answers.append([room_name, controller["x"] if orientation in [HAUT, BAS] else controller["x"] - 4 if orientation == DROITE else controller["x"] + 4, controller["y"] if orientation in [GAUCHE, DROITE] else controller["y"] - 4 if orientation == BAS else controller["y"] + 4])
for answer in answers:
    print(answer)