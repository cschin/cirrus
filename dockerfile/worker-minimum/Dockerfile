FROM ubuntu
RUN apt-get update -qq && \
apt-get install -qqy tar gzip curl jq  && \
apt-get install -qqy python3 python3-pip python3-redis vim-tiny less
RUN pip3 install httpie request
WORKDIR /tmp
COPY trigger.py /tmp/
CMD ["bash", "-c", "python3 trigger.py"]
