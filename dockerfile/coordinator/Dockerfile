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

# install uwsgi
RUN pip3 install uwsgi

# Setup Supervisor
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf


RUN pip3 install pyzmq Flask

# Copy Application
COPY coordinator.py /var/www/app/

COPY coordinator.py /tmp/
CMD ["bash", "-c", "service redis-server restart && /usr/bin/supervisord"]
#CMD ["bash", "-c", "service redis-server restart && python3 coordinator.py >& log"]
