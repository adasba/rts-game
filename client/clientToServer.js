function clientToServer(transform, inputs) {
    var data = {
        transform: transform,
        inputs: inputs
    };
    gameRoom.incomingData.push(data);
}