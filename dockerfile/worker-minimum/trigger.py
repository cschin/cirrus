# client.py
import requests
import time
import json
import sys
import os
from pprint import pprint

CURL =" http://coordinator"

rule_id = os.environ['RULE_ID']
force = os.environ['FORCE']
r = requests.get("{}/r/rule/{}".format(CURL, rule_id))
rule_json =  r.json()["payload"]

triggering_event_set = list(rule_json.keys())[0]
next_event_set = rule_json[triggering_event_set].get("triggering", None)

if next_event_set is not None:
    r = requests.get("{}/r/event_set/{}".format(CURL, next_event_set))
    next_events = r.json()["payload"]
    for e in next_events:
        r = requests.post("{}/r/event/{}".format(CURL, e),
                        json={"action":"trigger", "force":force})
        print(r.json())

