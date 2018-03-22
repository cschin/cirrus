import requests
import json
from pprint import pprint

crdURL = "http://127.0.0.1:7000"
events = {"ns:event:1":{},
          "ns:event:2":{},
          "ns:event:3":{},
          "ns:event:4":{},
          "ns:event:5":{}}

event_set = { e:[e] for e in events }
event_set["ns:event_set:1"] = ["ns:event:1", "ns:event:4"]

rules = {"ns:rule:1": {
            "ns:event:1": {
              "activity": {"cmd":"__auto_trigger__"},
              "triggering": "ns:event:2",
              "attempts": 1 }},
        "ns:rule:2": {
            "ns:event:2": {
              "activity": {"cmd":"__auto_trigger__"},
              "triggering": "ns:event:3",
              "attempts": 1 }},
        "ns:rule:3": {
            "ns:event:3": {
              "activity": {"cmd":"__auto_trigger__"},
              "triggering": "ns:event:4",
              "attempts": 1 }},
        "ns:rule:4": {
            "ns:event_set:1": {
              "activity": {"cmd":"__auto_trigger__"},
              "triggering": "ns:event:5",
              "attempts": 1 }}
        }


pprint(events)
pprint(event_set)
pprint(rules)

for e, payload in events.items():
    requests.put("http://127.0.0.1:7000/r/event/{}".format(e),
                  json=json.dumps(payload))

for es, payload in event_set.items():
    requests.put("http://127.0.0.1:7000/r/event_set/{}".format(es),
                  json=json.dumps(payload))

for r, payload in rules.items():
    requests.put("http://127.0.0.1:7000/r/rule/{}".format(r),
                  json=json.dumps(payload))


r = requests.get("http://127.0.0.1:7000/q/queue:event")
print(r.json())

r = requests.get("http://127.0.0.1:7000/q/event")
print(r.json())

r = requests.get("http://127.0.0.1:7000/q/event_set")
print(r.json())

r = requests.get("http://127.0.0.1:7000/q/rule")
print(r.json())
