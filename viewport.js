"use strict";
class ViewPort {
    constructor(gl, canvas, cbRender) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetY_anim = this.offsetY;
        this.WORLD_WIDTH = 700;
        this.y_scale = 1;
        this.row_size = 15;
        this.isDragging = false;
        this.y_scale_optimal = 0;
        this.y_scale_optimal_mouse = 0;
        this.wheel_scale_factor = 0.7;
        this.y_anim_snap_threshold = 0.005;
        this.y_anim_speed_factor = 7;
        this.viz_factor1 = 0;
        this.viz_factor2 = 0;
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     resizeEventHandler
        //
        this.resizeEventHandler = (event) => {
            if (event) {
                let a = 1;
            }
            // requestAnimationFrame(this.cbRender);
        };
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     handleMouseUp
        //
        this.handleMouseUp = (event) => {
            if (event.button !== 0) {
                return;
            }
            this.isDragging = false;
            this.offsetX += (this.x_current - this.x_down);
            this.offsetY += (this.y_current - this.y_down);
            Logger.log(1, "'handleMouseUp delta (" + (this.x_current - this.x_down) + "'," + (this.y_current - this.y_down) + "')");
            // requestAnimationFrame(this.cbRender);
        };
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     handleMouseMove
        //
        this.handleMouseMove = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.x_current = event.clientX - rect.left;
            this.y_current = event.clientY - rect.top;
            if (this.isDragging) {
                // requestAnimationFrame(this.cbRender);
            }
        };
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     handleKeyDown
        //
        this.handleKeyDown = (event) => {
            Logger.log(5, "keycode = " + event.keyCode);
            const viz_factor1_old = this.viz_factor1;
            const viz_factor2_old = this.viz_factor2;
            const viz_change_factor = 0.05;
            if (event.keyCode === 81) {
                this.viz_factor1 -= viz_change_factor;
            }
            else if (event.keyCode === 87) {
                this.viz_factor1 += viz_change_factor;
            }
            if (event.keyCode === 65) {
                this.viz_factor2 -= viz_change_factor;
            }
            else if (event.keyCode === 83) {
                this.viz_factor2 += viz_change_factor;
            }
            if (this.viz_factor1 < 0) {
                this.viz_factor1 = 0;
            }
            if (this.viz_factor1 > 1) {
                this.viz_factor1 = 1;
            }
            if (this.viz_factor2 < 0) {
                this.viz_factor2 = 0;
            }
            if (this.viz_factor2 > 1) {
                this.viz_factor2 = 1;
            }
            if (this.viz_factor1 !== viz_factor1_old || this.viz_factor2 !== viz_factor2_old) {
                Logger.log(5, "vizfactor1 = " + this.viz_factor1 + ", vizfactor2 = " + this.viz_factor2);
                // requestAnimationFrame(this.cbRender);
            }
        };
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     handleMouseDown
        //
        this.handleMouseDown = (event) => {
            if (event.button !== 0) {
                return;
            }
            const rect = this.canvas.getBoundingClientRect();
            this.isDragging = true;
            this.x_down = event.clientX - rect.left;
            this.y_down = event.clientY - rect.top;
            this.trace(this.y_down);
            this.x_current = this.x_down;
            this.y_current = this.y_down;
            this.logCanvasSize();
            // display height extent in world space:
            const row0_new = this.get_row_min();
            const row1_new = this.get_row_max();
            Logger.log(1, "'Rows on display2: [" + row0_new + "," + row1_new + "]");
            Logger.log(1, "'handleMouseDown at " + this.x_down + "," + this.y_down + ")");
        };
        ///////////////////////////////////////////////////////////////////////////////////////
        //
        //     handleMouseWheel
        //
        this.handleMouseWheel = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const y_mouse = event.clientY - rect.top;
            const d = event.wheelDelta;
            let y_scale_new;
            const y_scale_current = (this.y_scale_optimal === 0) ? this.y_scale : this.y_scale_optimal;
            if (d < 0) {
                y_scale_new = y_scale_current * this.wheel_scale_factor;
            }
            else {
                y_scale_new = y_scale_current / this.wheel_scale_factor;
            }
            this.y_scale_optimal = y_scale_new;
            this.y_scale_optimal_mouse = y_mouse;
            // requestAnimationFrame(this.cbRender);
        };
        this.gl = gl;
        this.canvas = canvas;
        canvas.onmousedown = this.handleMouseDown;
        canvas.onmouseup = this.handleMouseUp;
        canvas.onmousemove = this.handleMouseMove;
        canvas.onmousewheel = this.handleMouseWheel;
        window.addEventListener("resize", this.resizeEventHandler, false);
        window.addEventListener("keydown", this.handleKeyDown, false);
        this.cbRender = cbRender;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     logCanvasSize
    //
    logCanvasSize() {
        let x = this.canvas.width;
        let y = this.canvas.height;
        Logger.log(1, "'gl.canvas size = (" + x + "'," + y + ")");
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     trace
    //
    trace(y_mouse) {
        Logger.log(1, "trace at y = " + y_mouse);
        const screen_y = y_mouse;
        const content_y = (screen_y - this.offsetY) / this.y_scale;
        const row = content_y / this.row_size;
        Logger.log(5, "'trace at screen y = " + screen_y + "' gives row = " + row);
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     GetVizFactor1
    //
    GetVizFactor1() {
        return this.viz_factor1;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     SetVizFactor1
    //
    SetVizFactor1(factor) {
        this.viz_factor1 = factor;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     GetVizFactor2
    //
    GetVizFactor2() {
        return this.viz_factor2;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     SetVizFactor2
    //
    SetVizFactor2(factor) {
        this.viz_factor2 = factor;
    }
    //////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_offset
    //
    animate_y_offset() {
        let diff = this.getOffsetY() - this.offsetY_anim;
        const N = this.y_anim_speed_factor;
        diff = (N - 1) * diff / N;
        if (Math.abs(diff) < this.y_anim_snap_threshold) {
            this.offsetY_anim = this.getOffsetY();
        }
        else {
            this.offsetY_anim = this.getOffsetY() - diff;
            // requestAnimationFrame(this.cbRender);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     set_y_scale_and_adjust_offset
    //
    set_y_scale_and_adjust_offset(y_scale_new, y_mouse) {
        const content_y0 = (y_mouse - this.offsetY) / this.y_scale;
        this.y_scale = y_scale_new;
        this.offsetY = y_mouse - content_y0 * this.y_scale;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_end_and_stop
    //
    animate_y_end_and_stop() {
        if (this.y_scale_optimal === 0) {
            return;
        }
        this.set_y_scale_and_adjust_offset(this.y_scale_optimal, this.y_scale_optimal_mouse);
        this.y_scale_optimal = 0;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getOffsetY
    //
    getOffsetY() {
        if (this.isDragging) {
            return (this.offsetY + (this.y_current - this.y_down)) / this.y_scale;
        }
        else {
            return this.offsetY / this.y_scale;
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getCurrentY
    //
    getCurrentY() {
        return this.y_current;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_scale
    //
    animate_y_scale() {
        if (this.y_scale_optimal === 0) {
            return;
        }
        let y_diff = this.y_scale - this.y_scale_optimal;
        const N = 7;
        y_diff = (N - 1) * y_diff / N;
        const y_scale_new = y_diff + this.y_scale_optimal;
        if (Math.abs(y_diff) < this.y_anim_snap_threshold) {
            console.log("'Animation met threshold");
            this.animate_y_end_and_stop();
        }
        else {
            this.set_y_scale_and_adjust_offset(y_scale_new, this.y_scale_optimal_mouse);
            // requestAnimationFrame(this.cbRender);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     get_row_min
    //
    get_row_min() {
        let rOffsetYScaled = this.getOffsetY();
        let frow0 = -rOffsetYScaled;
        frow0 = frow0 / this.row_size;
        let row0 = Math.round(frow0) - 1;
        if (row0 < 0) {
            row0 = 0;
        }
        return row0;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     get_row_max
    //
    get_row_max() {
        let rOffsetYScaled = this.getOffsetY();
        let frow1 = this.gl.canvas.height / this.y_scale - rOffsetYScaled;
        frow1 = frow1 / this.row_size;
        let row1 = Math.round(frow1) + 1;
        if (row1 < 0) {
            row1 = 0;
        }
        return row1;
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     resize
    //
    resize() {
        // lookup the size the browser is displaying the canvas.
        let displayWidth = this.canvas.clientWidth;
        let displayHeight = this.canvas.clientHeight;
        // check if the canvas is not the same size.
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            // make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }
    animate() {
        this.animate_y_offset();
        this.animate_y_scale();
    }
}
