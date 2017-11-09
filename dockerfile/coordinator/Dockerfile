FROM ubuntu
RUN apt-get update  && \
apt-get install -y tar gzip curl jq  && \
apt-get install -y python3 python3-pip python3-redis redis-server vim-tiny nginx supervisor uwsgi

# Setup Nginx
RUN rm /etc/nginx/sites-enabled/default
COPY flask.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/flask.conf /etc/nginx/sites-enabled/flask.conf
COPY uwsgi.ini /var/www/app/
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# install uwsgi pyzmq Flask 
RUN pip3 install uwsgi pyzmq Flask

# Setup Supervisor
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy Application
COPY coordinator.py zmq_bridge.py /var/www/app/
WORKDIR /var/www/app/
#CMD ["bash", "-c", "service redis-server restart && python3 zmq_bridge.py && /usr/bin/supervisord"]
CMD ["bash", "-c", "service redis-server start && /usr/bin/supervisord"]
#CMD ["bash", "-c", "service redis-server restart && python3 coordinator.py >& log"]
