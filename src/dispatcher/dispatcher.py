import zmq
import requests
import time
import json
# import logging
import docker
import sys
import os
import random

# TODO: get these constant fron env
ZMQ_HOST = 'coordinator'
ZMQ_PULL_PORT = '7777'

USE_POLLER = True


class RuleEventClient(object):

    def __init__(self, host, pull_port):
        self.host = host
        self.pull_port = pull_port
        self.ctx = zmq.Context()
        self._stop = 0

        self.pull = self.ctx.socket(zmq.PULL)
        self.pull.connect('tcp://{}:{}'.format(self.host, self.pull_port))
        # self.pull.setsockopt(zmq.TCP_KEEPALIVE, 1)
        # self.pull.setsockopt(zmq.TCP_KEEPALIVE_IDLE, 300)
        # self.pull.setsockopt(zmq.TCP_KEEPALIVE_INTVL, 300)

        if USE_POLLER:
            self.poller = zmq.Poller()
            self.poller.register(self.pull, zmq.POLLIN)

        self.docker_client = docker.from_env()
        self.docker_services = self.docker_client.services
        self.events = {}  # all received events
        self.event_sets = {}  # all receeved events
        self.rule = {}  # all received rule
        print("dispatcher initiated pid={}".format(os.getpid()),
              file=sys.stderr)

    def receive_event(self):
        counter = 0
        while True:
            if USE_POLLER:
                polls = dict(self.poller.poll(1000))
                if self.pull not in polls:
                    counter += 1
                    if counter % 120 != 0:
                        continue
                    # Yes, I know this is ugly. However, this is one solution
                    # that I find working. The "keep alive" options do not
                    # seem to keep the socket alive. Without re-creating a
                    # connection, the socket won't revice new message.
                    # TODO: find an elegent solution about this.
                    self.poller.unregister(self.pull)
                    self.pull.close()
                    self.pull = self.ctx.socket(zmq.PULL)
                    self.pull.connect('tcp://{}:{}'.format(self.host,
                                                           self.pull_port))
                    self.poller.register(self.pull, zmq.POLLIN)
                    continue
            message = self.pull.recv_string()
            message = json.loads(message)
            rule_id, rule = list(message["rule"].items())[0]  # only one object
            r = requests.post("http://coordinator/r/rule/{}".format(rule_id),
                              json={"action": "dispatch"})
            force = message["force"]

            trigger_event_set, payload = list(rule.items())[0]
            # print(trigger_event_set, file=sys.stderr)
            # print(payload, file=sys.stderr)
            next_event_set = payload.get("triggering", None)
            activity = payload["activity"]
            cmd = activity["cmd"]
            # print("cmd: ", cmd, file=sys,stderr)
            # print(""next:", next_event_set, file=sys.stderr)

            if cmd == "__auto_trigger__" and next_event_set is not None:
                r = requests.get(
                    "http://coordinator/r/event_set/{}".format(next_event_set))
                next_events = r.json()["payload"]
                for e in next_events:
                    r = requests.post("http://coordinator/r/event/{}".format(e),
                                      json={"action": "trigger",
                                            "force": force})
            elif "task_type" in activity and \
                    activity["task_type"] == "docker":
                try:
                    self.run_docker_task(rule_id, activity,
                                         trigger_event_set, force)
                except Exception as e:
                    print("Exception when starting docker task:",
                          e, file=sys.stderr)
                    pass

    def run_docker_task(self, rule_id, activity, trigger_event_set, force):
        image = activity["image"]
        cmd = activity["cmd"]
        name = "{}-{}-{}".format(rule_id.replace(":", "-"),
                                 str(time.time()).replace(".", "-"),
                                 random.randint(0, 100))
        env = ["TRIGGER={}".format(trigger_event_set),
               "RULE_ID={}".format(rule_id),
               "NAME={}".format(name),
               "FORCE={}".format(force)]

        if "env" in activity:
            env.update(activity["env"])

        if "cpu_reservation" in activity:
            cpu_reservation = int(1e9 * float(activity["cpu_reservation"]))
        else:
            cpu_reservation = int(1e9)

        if "mem_reservation" in activity:
            mem_reservation = int(1e9 * float(activity["mem_reservation"]))
        else:
            mem_reservation = int(1e9)

        if "mounts" in activity:
            mounts =  activity["mounts"]
        else:
            mounts = []

        resources = docker.types.Resources(cpu_reservation=cpu_reservation,
                                           mem_reservation=mem_reservation)

        restart_policy = docker.types.RestartPolicy(condition="none",
                                                    max_attempts=1)

        service_mode = docker.types.ServiceMode(mode="replicated", replicas=1)

        self.docker_client.containers.prune()

        srv = self.docker_services.create(image,
                                          command=cmd,
                                          name=name,
                                          env=env,
                                          mode=service_mode,
                                          mounts=mounts,
                                          networks=["cirrus"],
                                          resources=resources,
                                          restart_policy=restart_policy)
        # TODO:proper logging
        print("docker attr:", srv.attrs, file=sys.stderr)


if __name__ == "__main__":
    rclient = RuleEventClient(ZMQ_HOST, ZMQ_PULL_PORT)
    rclient.receive_event()
