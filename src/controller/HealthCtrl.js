const kafka = require('kafka-node');
const config = require("../kafka/kafka-config");

exports.health = (req, res) =>{
    try {
        const client = new kafka.KafkaClient({ kafkaHost: config.kafka_host });

        client.loadMetadataForTopics(["watch","weather"], (err, resp) => {
            if(err && err.message.includes("Request timed out")){
                return  res.status(503).json({health: "DOWN", status: "NOT READY", cause: err.message});
            } else if(err) {
                return res.status(400).json({health: "DOWN", status: "ERROR", cause: err});
            }
            console.log(JSON.stringify(resp));
            res.status(200).json({health: "UP"});
        });
    }catch(e) {
        return res.status(400).json({health: "DOWN", status: "ERROR", cause: err});
    }
}
