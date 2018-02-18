FROM ubuntu
RUN apt-get update  && \
apt-get install -y tar gzip curl jq npm 
COPY app /app/
RUN cd /app && npm install 
RUN cd /app && cp webpack.config.dev.js node_modules/react-scripts/config/webpack.config.dev.js
# --save react react-dom  react-scripts bootstrap react-table match-sorter react-bootstrap axios
RUN ln -s /usr/bin/nodejs /usr/bin/node
ENV REACT_APP_APP_BACKEND_BASEURL coordinate:7000
CMD cd /app && npm start
