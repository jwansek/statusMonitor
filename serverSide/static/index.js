window.onload = function() {
    document.getElementById("nojs").style.display = 'none';

    fetch("/host").then(function (response) {
        return response.json();
        console.log(response.json());
    }).then(function (jsonresponse) {
        const ip = jsonresponse;
        document.getElementById("title").innerHTML = ip + " status monitor";
        displaySystemStatus();
        updateDockerTable(ip);
    });
};

async function displaySystemStatus() {
    fetch("/sys").then(function (response) {
        return response.json();
    }).then(function (jsonresponse) {
        document.getElementById("cpu").innerHTML = getPercentageBar(40, jsonresponse["cpu_percent"]);
        document.getElementById("memory").innerHTML = getPercentageBar(40, jsonresponse["memory"][2]);
        document.getElementById("memorymisc").innerHTML = bytes_size_to_str(jsonresponse["memory"][3]) + "/" + bytes_size_to_str(jsonresponse["memory"][0]);
        document.getElementById("storage").innerHTML = getPercentageBar(40, jsonresponse["storage"][3]);    
        document.getElementById("storagemisc").innerHTML = bytes_size_to_str(jsonresponse["storage"][1]) + "/" + bytes_size_to_str(jsonresponse["storage"][0]);
        document.getElementById("swap").innerHTML = getPercentageBar(40, jsonresponse["swap"][3]);
        document.getElementById("swapmisc").innerHTML = bytes_size_to_str(jsonresponse["swap"][1]) + "/" + bytes_size_to_str(jsonresponse["swap"][0]);
    });

    await sleep(2000);
    displaySystemStatus();
}

async function updateDockerTable(host) {
    const dockertable = document.getElementById("dockertable");

    fetch("/docker").then(function (response) {
        return response.json();
    }).then(function (jsonresponse) {
        dockertable.innerHTML = "";
        jsonresponse.forEach(function (container) {
            var row = dockertable.insertRow(0);
            let statusCell = row.insertCell(0)
            statusCell.innerHTML = container["status"];
            if (container["status"] === "running") {
                statusCell.classList.add(container["status"]);
            } else {
                statusCell.classList.add("notrunning");
            }

            row.insertCell(1).innerHTML = container["name"];
            row.insertCell(2).innerHTML = container["cpu"] + "%";
            row.insertCell(3).innerHTML = bytes_size_to_str(container["memory"]["usage"]) + " / " + bytes_size_to_str(container["memory"]["max"]);

            let portsCell = row.insertCell(4);
            Object.keys(container["ports"]).forEach(function (key) {
                try {
                    portsCell.innerHTML = key.link("http://" + host + ":" + container["ports"][key][0]["HostPort"]);
                } catch (e) {
                    portsCell.innerHTML = "";
                }
            });

            Object.keys(container["network"]).forEach(function (key) {
                row.insertCell(5).innerHTML = key + ": rx:" + bytes_size_to_str(container["network"][key]["rx_bytes"]) + " tx:" + bytes_size_to_str(container["network"][key]["tx_bytes"])
            });
        });
    });

    await sleep(5000);
    updateDockerTable(host);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPercentageBar(length, percentage) {
    let completed = Math.round(length * (percentage / 100));
    return "[" + "|".repeat(completed) + "_".repeat(length - completed) + "] " + percentage + "%";
}

function bytes_size_to_str(size) {
    const KB = 1024.0;
    const MB = KB * KB;
    const GB = MB * KB;

    if (size >= GB) {
        return Math.round(size / GB) + " GB";
    } else if (size >= MB) {
        return Math.round(size / MB) + " MB";
    } else if (size >= KB) {
        return Math.round(size / KB) + " KB";
    } else {
        return size + " bytes";
    }
}
