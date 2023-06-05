class MockStream {
    constructor(audioElement) {
        const audioContext = new window.AudioContext();
        const track = audioContext.createMediaElementSource(audioElement);
        const dest = audioContext.createMediaStreamDestination();

        track.connect(audioContext.destination);
        track.connect(dest);

        this.stream = dest.stream;
    }
}

export default MockStream;
