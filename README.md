We need to enable docker's remote API. To do this we use sherpa:

`docker pull djenriquez/sherpa`

Then run:

    docker run -d \
    --name sherpa \
    -e CONFIG='[
        { 
            "Path" : "/",
            "Access": "allow",
            "Addresses": ["10.0.0.0/8", "192.168.0.0/16", "172.0.0.0/8"]
        }
    ]' \
    -v /var/run/docker.sock:/tmp/docker.sock \
    -p 4550:4550 \
    djenriquez/sherpa --allow

Next build the docker container (clone the git first if not done already)

`sudo docker build -t statusmonitor:latest .`

Finally set up the container:

`sudo docker run --name statusmonitor --net=host -d statusmonitor`
