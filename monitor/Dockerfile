FROM ubuntu
RUN apt-get update  && \
apt-get install -y tar gzip curl jq npm 
COPY app /app/
RUN cd /app && npm install 
# --save react react-dom  react-scripts bootstrap react-table match-sorter react-bootstrap axios
RUN ln -s /usr/bin/nodejs /usr/bin/node
ENV REACT_APP_APP_BACKEND_BASEURL coordinate:7000
CMD cd /app && npm start
