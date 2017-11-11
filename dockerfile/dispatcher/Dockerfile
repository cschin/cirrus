FROM ubuntu
RUN apt-get update -qq && \
apt-get install -qqy tar gzip curl jq  && \
apt-get install -qqy software-properties-common apt-transport-https ca-certificates && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
DEBIAN_FRONTEND=noninteractive add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" && \
apt-get update -qq && \
apt-cache policy docker-ce && \
apt-get install -qqy docker-ce=17.09.0~ce-0~ubuntu 
RUN apt-get install -qqy python3 python3-pip python3-redis redis-server vim supervisor
RUN pip3 install pyzmq docker Flask
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY dispatcher.py /tmp/
CMD ["/usr/bin/supervisord"]
