import platform
import socket
import docker
import psutil
import flask
import json

def get_server_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    host = str(s.getsockname()[0])
    s.close()
    return host

app = flask.Flask(__name__)
client = docker.DockerClient(base_url = "tcp://%s:4550" % get_server_ip())

@app.route("/")
def hello_world():
    return flask.render_template("index.html")

@app.route("/sys")
def get_sys_info():
    return flask.jsonify({
        "cpu_percent": psutil.cpu_percent(),
        "memory": psutil.virtual_memory(),
        "swap": psutil.swap_memory(),
        "storage": psutil.disk_usage("/")
    })

@app.route("/docker")
def get_docker_info():
    return flask.jsonify(get_docker_containers())

@app.route("/host")
def get_host():
    return flask.jsonify(get_server_ip());

def get_docker_containers():
    out = []
    for container in client.containers.list(all = True):
        # doing it like this since .stats(stream = False) is broken apparently
        containerobj = next(container.stats(decode = True))
        outobj = {
            "id": containerobj["id"],
            "name": containerobj["name"],
            "cpu": containerobj["precpu_stats"]["cpu_usage"]["total_usage"],
            "status": container.status,
            "ports": container.ports,
        }
        try:
            outobj["memory"] = {
                "usage": containerobj["memory_stats"]["usage"],
                "max": containerobj["memory_stats"]["limit"]
            }
            outobj["network"] = containerobj["networks"]
        except KeyError:
            outobj["memory"] = {"usage": 0, "max":0}
            outobj["network"] = {}
      
        out.append(outobj)



    return out

if __name__ == "__main__":
    app.run(host='0.0.0.0')
    # print(get_docker_containers())

