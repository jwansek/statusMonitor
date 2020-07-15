import platform
import docker
import psutil
import flask
import json
app = flask.Flask(__name__)
client = docker.from_env()

@app.route("/")
def hello_world():
    return flask.jsonify("Hello World!")

@app.route("/sys")
def get_sys_info():
    return flask.jsonify({
        "cpu_percent": psutil.cpu_percent(),
        "temps": psutil.sensors_temperatures(),
        "memory": psutil.virtual_memory()
    })

@app.route("/docker")
def get_docker_info():
    out = {}
    for container in client.containers.list():
        print(container)
    return flask.jsonify(out)



if __name__ == "__main__":
    # app.run(host='0.0.0.0')

    print(get_docker_info())