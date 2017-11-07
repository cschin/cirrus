import requests
import json
from pprint import pprint

crdURL = "http://127.0.0.1:7000"

triggers = {"ns:event:1":{"action":"trigger"},
            "ns:event:2":{"action":"trigger"},
            "ns:event:3":{"action":"trigger"},
            "ns:event:5":{"action":"trigger"}}


for e, payload in sorted(triggers.items()):
    payload["force"] = "true"
    r = requests.post("http://127.0.0.1:7000/r/event/{}".format(e),
                      json=payload)
    print(r.json())
