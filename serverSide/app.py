import platform
import docker
import psutil
import flask
import json
app = flask.Flask(__name__)
client = docker.from_env()

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

def get_docker_containers():
    out = []
    for container in client.containers.list():
        containerobj = json.loads(next(container.stats()).decode())
        out.append({
            "id": containerobj["id"],
            "name": containerobj["name"],
            "memory": {
                "usage": containerobj["memory_stats"]["usage"],
                "max": containerobj["memory_stats"]["limit"]
            },
            "cpu": containerobj["precpu_stats"]["cpu_usage"]["total_usage"],
            "status": container.status,
            "ports": container.ports
        })


    return out

if __name__ == "__main__":
    app.run(host='0.0.0.0')
    # print(get_docker_containers())

