#docker run --hostname msgrelay --name msgrelay --network host --rm -p 6000:6000 -p 6379:6379 -t msgrelay
docker container kill coordinator
docker container kill dispatcher
docker build -t coordinator coordinator/
docker build -t dispatcher dispatcher/
#docker run --hostname coordinator --name coordinator --network host --rm -p 7000:7000 -p 6379:6379 -t coordinator &


docker run --hostname coordinator --name coordinator --rm -p 7000:7000 -t coordinator &
sleep 1
docker run --hostname dispatcher --name dispatcher --link coordinator  --rm  -t dispatcher &
