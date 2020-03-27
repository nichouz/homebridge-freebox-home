let fs = require('fs')
let Node = require('./../controllers/Node')

module.exports = function(nodeController) {
    this.nodeController = nodeController
    this.setup = function(callback) {
        let homedir = require('os').homedir()
        let confFilePath = homedir+'/.homebridge/config.json'
        if(!fs.existsSync(confFilePath)) {
            this.createEmptyConfigFile(confFilePath)
        }
        fs.readFile(confFilePath, (err, data) => {
            let config = JSON.parse(data)
            this.getAccessories((accessories) => {
                config.accessories = accessories
                fs.writeFile(confFilePath, JSON.stringify(config), (err) => {
                    callback(true)
                })
            })
        })
    }

    this.getAccessories = function(callback) {
        nodeController.getNodeList((list) => {
            let accessories = []
            for (node of list) {
                if (node.type == 'pir' || node.type == 'dws') {
                    let type = node.type == 'pir' ? 'motion-sensor' : 'ContactSensor'
                    let data = {
                        accessory: type,
                        name: node.label,
                        pollInterval: 1000,
                        statusUrl: 'http://localhost:8888/api/node/'+node.id
                    }
                    accessories.push(data)
                }
            }
            callback(accessories)
        })
    }

    this.randomHex = function(len) {
        var maxlen = 8,
            min = Math.pow(16,Math.min(len,maxlen)-1) 
            max = Math.pow(16,Math.min(len,maxlen)) - 1,
            n = Math.floor(Math.random() * (max-min+1)) + min,
            r = n.toString(16);
        while (r.length < len) {
           r = r + randHex(len - maxlen)
        }
        return r
    }

    this.createEmptyConfigFile = function(dir) {
        var mac = this.randomHex(2)
        for (var j = 1;j<6;j++) {
            mac = mac + ':' + this.randomHex(2);
        }
        mac = mac.toUpperCase()
        let data = {
                "bridge": {
                    "name": "Freebox Homebridge",
                    "username": mac,
                    "port": 51826,
                    "pin": "123-45-678"
                },
                "description": "Homebridge configuration file.",
                "ports": {
                    "start": 52100,
                    "end": 52150,
                    "comment": "This section is used to control the range of ports that separate accessory (like camera or television) should be bind to."
                },
                "accessories": [],
                "platforms": []
            }
        fs.writeFileSync(dir, JSON.stringify(data));
        console.log('[i] Homebridge config file created')
    }
}