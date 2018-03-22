# example to setup the coordinator, dispatcher and monitor with docker swarm service model
docker network rm cirrus
docker service rm coordinator
docker service rm dispatcher
docker service rm monitor

docker swarm leave -f
docker build -t coordinator coordinator/
docker build -t dispatcher dispatcher/
docker build -t worker worker-minimum/
docker build -t monitor monitor/

docker swarm init
docker network create --subnet 10.0.0.0/16 --driver overlay cirrus 
# port 7000 us used as HTTP server and 8081 is for ZeroMQ
docker service create --hostname coordinator --name coordinator --network cirrus --publish 7000:80 --publish 8081:8081 -d coordinator 
sleep 1
# there can be multiple dispatchers if one likes
docker service create --hostname dispatcher --name dispatcher --network cirrus --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock -d  dispatcher 

# set the  REACT_APP_APP_BACKEND_BASEURL to 127.0.0.1, we need SSH tunneling on both port 3000 and 7000 as the request on coordinator is from the client side
docker service create --hostname monitor --name monitor --network cirrus -e REACT_APP_APP_BACKEND_BASEURL=127.0.0.1:7000 --publish 3000:3000 -d monitor:latest

