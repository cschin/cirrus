#docker run --hostname msgrelay --name msgrelay --network host --rm -p 6000:6000 -p 6379:6379 -t msgrelay

docker network rm cirrus
docker service rm coordinator
docker service rm dispatcher
docker swarm leave -f
docker build -t coordinator coordinator/
docker build -t dispatcher dispatcher/
#docker run --hostname coordinator --name coordinator --network host --rm -p 7000:7000 -p 6379:6379 -t coordinator &


docker swarm init
docker network create --subnet 10.0.0.0/16 --driver overlay cirrus 
docker service create --hostname coordinator --name coordinator --mode global --network cirrus --publish 7000:80 -t coordinator 
sleep 1
docker service create --hostname dispatcher --name dispatcher  --network cirrus --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock -t dispatcher 