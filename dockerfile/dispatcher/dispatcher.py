# client.py
import zmq
import requests
import time
import json
import logging
import threading
import docker
import sys
import os
from pprint import pprint


ZMQ_HOST = 'coordinator'
ZMQ_PULL_PORT = '7777'


class RuleEventClient(threading.Thread):

    def __init__(self, host, pull_port):
        threading.Thread.__init__(self)
        self.host = host
        self.pull_port = pull_port
        self.ctx = zmq.Context()
        self._stop = 0

        self.pull = self.ctx.socket(zmq.PULL)
        self.pull.connect('tcp://{}:{}'.format(self.host, self.pull_port))

        self.poller = zmq.Poller()
        self.poller.register(self.pull, zmq.POLLIN)

        self.docker_client = docker.from_env()
        self.events = {}  # all received events
        self.event_sets = {}  # all receeved events
        self.rule = {}  # all received rule
        print("Client Initiated pid={}".format(os.getpid()))

    def receive_event(self):
        pid = os.getpid()
        while True:
            polls = dict(self.poller.poll(1000))
            if self.pull not in polls:
                continue
            message = self.pull.recv_string()
            message = json.loads(message)
            rule_id, rule = list(message["rule"].items())[0]  # only one object
            r = requests.post("http://coordinator/r/rule/{}".format(rule_id),
                              json={"action":"dispatch"})
            force = message["force"]
            for trigger_event_set, payload in rule.items():
                # print(pid, trigger_event_set, file=sys.stderr)
                # print(pid, payload, file=sys.stderr)
                next_event_set = payload["triggering"]
                cmd = payload["activity"]["cmd"]
                # print(pid, "cmd: ", cmd)
                # print(pid, "next:", next_event_set, file=sys.stderr)

                if cmd == "__auto_trigger__":
                    r = requests.get("http://coordinator/r/event_set/{}".format(next_event_set))
                    next_events = r.json()["payload"]
                    for e in next_events:
                        r = requests.post("http://coordinator/r/event/{}".format(e),
                                          json={"action":"trigger", "force":force})




if __name__ == "__main__":
    rclient = RuleEventClient(ZMQ_HOST, ZMQ_PULL_PORT)
    rclient.receive_event()
