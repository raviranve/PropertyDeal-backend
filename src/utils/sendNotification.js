const sendNotification =  (io, event, data) => {
    if (io) {
        io.emit(event, data);
    } else {
        console.error("Socket.io instance not available");
    }
};

module.exports = sendNotification;