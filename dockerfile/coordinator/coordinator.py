import json
import redis
import time
import zmq
from flask import Flask
from flask_cors import CORS
from flask import request

REDIS_HOST = "127.0.0.1"
REDIS_PORT = 6379

ZMQ_HOST = "0.0.0.0"
ZMQ_PORT = "7776"


def send_message(message):
    ctx = zmq.Context()
    zmq_socket = ctx.socket(zmq.PUSH)
    zmq_push_url = 'tcp://{}:{}'.format(ZMQ_HOST, ZMQ_PORT)
    s_count = 0
    rtn = False
    zmq_socket.connect(zmq_push_url)
    while 1:
        s_count += 1
        if s_count >= 10:
            break
        try:
            zmq_socket.send_string(message, zmq.NOBLOCK)
            rtn = True
            break
        except zmq.error.Again:
            time.sleep(0.1)

    return rtn


def get_triggered_rules(triggering_event, force="false"):
    """
    Given a newly generated event, go over all event set
    to see which on is statisfied and then triggering the
    associated rule. If force is "false" and an event had
    be triggered before, the the event is ignored.
    """
    r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    event_queue = r.lrange("queue:event".encode("utf-8"), 0, -1)
    events_in_queue = set()

    for e in event_queue[:-1]:
        e = json.loads(e.decode("utf-8"))
        events_in_queue.update(e["payload"].keys())

    # if `force` is False, we won't trigger rules if an event have
    # already happend before
    if triggering_event in events_in_queue and force == "false":
        return []

    events_in_queue.add(triggering_event)

    triggering_event_set = []
    for es in r.scan_iter("event_set:*".encode("utf-8")):
        v = r.get(es)
        if v is not None:
            d = json.loads(v.decode("utf-8"))
            events_in_set = set(d["payload"])
            if triggering_event not in events_in_set:
                continue
            if events_in_set <= events_in_queue:
                _1, _2, es = es.decode("utf-8").partition(":")
                triggering_event_set.append(es)

    triggered_rules = []
    for rl in r.scan_iter("rule:*".encode("utf-8")):
        v = r.get(rl)
        d = json.loads(v.decode("utf-8"))
        _1, _2, rule_id = rl.decode("utf-8").partition(":")
        rule_data = d["payload"]
        for es in triggering_event_set:
            if es in rule_data:
                triggered_rules.append({rule_id: rule_data})

    return triggered_rules


app = Flask(__name__)
CORS(app)
application = app


@app.route("/r/<type_>/<id_>", methods=['GET', "PUT", 'POST', "DELETE"])
def _resource(type_, id_):
    """
    TODO: Add update / delete
    """
    r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    key = "{}:{}".format(type_, id_)
    if request.method == 'GET':
        payload = r.get(key)
        if payload is None:
            msg = json.dumps({"msg": "{} not found".format(key),
                              "status": "FAIL"})
            return msg, 404
        else:
            payload = json.loads(payload.decode("utf-8"))
            payload = payload["payload"]  # yes, I know it is ugly, fixme?
            return json.dumps({"payload": payload, "status": "OK"})
    elif request.method == "DELETE":
        r.delete(key)
        msg = json.dumps({"msg": "{} deleted".format(key),
                          "status": "OK"})
        return msg
    elif request.method == 'PUT':  # registering
        payload = json.loads(request.get_json())
        r.set(key.encode("utf-8"), json.dumps({"payload": payload,
                                               "ts": time.time()}))
        msg = json.dumps({"msg": "set {}".format(key),
                          "status": "OK"})
        return msg
    elif request.method == "POST":  # other action
        req = request.get_json()
        action = req["action"]
        force = req.get("force", "false")
        # currently, we only allow to send single event for triggering,
        # should we allow to a set of events as a single tigger?
        if action == "trigger" and type_ == "event":
            ts = time.time()
            key = "queue:{}".format(type_).encode("utf-8")
            msg = json.dumps({"payload": {id_: req}, "ts": ts})
            r.rpush(key, msg)
            triggered_rules = get_triggered_rules(id_, force=force)
            msgs = []
            for rule in triggered_rules:
                rule_id = list(rule.keys())[0]

                r_key = "queue:rule_state".encode("utf-8")
                r.rpush(r_key, json.dumps({"payload": {
                                              rule_id: {
                                                "state": "triggered",
                                                "ts": ts}}}))

                is_msg_sent = send_message(json.dumps({"rule": rule,
                                                       "force": force}))
                sent_status = "OK" if is_msg_sent else "FAIL"
                msgs.append({"msg": "rule '{}' trigged by '{}'".
                                    format(rule_id, id_),
                             "zmq_push_status": sent_status})
            msg = json.dumps({"msg": msgs,
                              "status": "OK"})
            return msg
        elif action in ("dispatch", "start", "end") and type_ == "rule":
            rule_id = id_
            ts = time.time()
            r_key = "queue:rule_state".format(type_).encode("utf-8")
            r.rpush(r_key, json.dumps({"payload": {
                                          rule_id: {
                                            "state": action,
                                            "ts": ts}}}))
            msg = json.dumps({"msg": "rule '{}' state '{}' recorded".
                                     format(id_, action),
                              "status": "OK"})
            return msg

        msg = json.dumps({"msg": "wrong action",
                          "status": "FAIL"})
        return msg


@app.route("/q/<type_>", methods=["GET", "DELETE"])
def _queue(type_):
    r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    if request.method == 'GET':
        if type_.split(":")[0] == "queue":
            key = "{}".format(type_).encode("utf-8")
            payload = r.lrange(key, 0, -1)
            if payload is None:
                return json.dumps({"msg": "{} not found".format(key)}), 404
            else:
                rtn = []
                for r in payload:
                    rtn.append(json.loads(r.decode("utf-8")))
                return json.dumps(rtn)
        else:
            rtn = {}
            key = "{}:*".format(type_).encode("utf-8")
            for rr in r.scan_iter(match=key):
                payload = r.get(rr)
                payload = json.loads(payload.decode("utf-8"))
                rtn[rr.decode("utf-8")] = payload
            return json.dumps(rtn)
    elif request.method == "DELETE":
        if type_.split(":")[0] == "queue":
            key = "{}".format(type_).encode("utf-8")
            r.delete(key)
            return "{} deleted".format(key)


if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=7000, debug=False)
    application.run()
