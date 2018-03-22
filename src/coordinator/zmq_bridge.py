import zmq


ZMQ_HOST = "0.0.0.0"
ZMQ_IN_PORT = "7776"
ZMQ_OUT_PORT = "7777"

ctx = zmq.Context()
zmq_pull_socket = ctx.socket(zmq.PULL)
zmq_push_socket = ctx.socket(zmq.PUSH)
zmq_pull_url = 'tcp://{}:{}'.format(ZMQ_HOST, ZMQ_IN_PORT)
zmq_push_url = 'tcp://{}:{}'.format(ZMQ_HOST, ZMQ_OUT_PORT)


def run():
    s_count = 0
    rtn = False
    zmq_pull_socket.bind(zmq_pull_url)
    zmq_push_socket.bind(zmq_push_url)
    while 1:
        msg = zmq_pull_socket.recv_string()
        zmq_push_socket.send_string(msg)

if __name__ == "__main__":
    run()
