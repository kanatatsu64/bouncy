class BtnControl {
    constructor(button, onDown, onLong, onUp, thTime=500) {
        this.button = button;
        this.thTime = thTime;
        this.isDown = false;
        this.downTime = 0;
        this.isTouch = false;

        const _onDown = () => {
            if (this.isDown) {
                return;
            }

            this.isDown = true;
            this.downTime = new Date().getTime();
            onDown();

            setTimeout(() => {
                if (this.isLongDown()) {
                    onLong();
                }
            }, this.thTime);
        }

        const _onUp = () => {
            if (!this.isDown) {
                return;
            }

            this.isDown = false;
            onUp();
        }

        if (button.ontouchstart === undefined) {
            button.onmousedown = _onDown;
            button.onmouseup = _onUp;
        } else {
            button.ontouchstart = _onDown;
            button.ontouchend = _onUp;
        }
    }

    isShortDown() {
        if (!this.isDown) {
            return false;
        }

        const nowTime = new Date().getTime();
        const duration = nowTime - this.downTime;
        return (duration < this.thTime);
    }

    isLongDown() {
        if (!this.isDown) {
            return false;
        }

        const nowTime = new Date().getTime();
        const duration = nowTime - this.downTime;
        return (duration >= this.thTime);
    }
}

export default BtnControl;
