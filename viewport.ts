

class ViewPort {

    offsetX : number = 0;
    offsetY : number = 0;
    private offsetY_anim = this.offsetY;

    WORLD_WIDTH : number = 700;

    y_scale : number = 1;

    row_size : number = 15;
    isDragging : boolean= false;

    x_down : number | undefined;
    y_down : number | undefined;

    x_current : number | undefined;
    y_current : number | undefined;

    y_scale_optimal : number = 0;
    y_scale_optimal_mouse : number = 0;

    wheel_scale_factor: number = 0.7;

    y_anim_snap_threshold : number = 0.005;
    y_anim_speed_factor : number = 7;


    viz_factor1 : number = 0;
    viz_factor2 : number = 0;

    start_year: number  = 0;
    end_year: number  = 0;

    gl : any;
    canvas : HTMLCanvasElement;

    cbRender : FrameRequestCallback;

    constructor(gl : any, canvas : HTMLCanvasElement, cbRender : FrameRequestCallback, start_year : number, end_year : number) {

        this.gl = gl;
        this.canvas = canvas;

        canvas.onmousedown = this.handleMouseDown;
        canvas.onmouseup = this.handleMouseUp;
        canvas.onmousemove = this.handleMouseMove;
        

        // canvas.onmousewheel = this.handleMouseWheel;
        window.addEventListener("wheel", this.handleMouseWheel);

        window.addEventListener("resize", this.resizeEventHandler, false);
        window.addEventListener("keydown", this.handleKeyDown, false);

        this.cbRender = cbRender;
        this.start_year = start_year;
        this.end_year = end_year;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     resizeEventHandler
    //

    getXFromTime(time: number): number {
        return GLUtils.static_get_x_from_time(this.start_year, this.end_year, this.WORLD_WIDTH, time);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     resizeEventHandler
    //

    resizeEventHandler = (event: any) => {

        if (event) {
            let a : number = 1;
        }
        // requestAnimationFrame(this.cbRender);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     logCanvasSize
    //

    logCanvasSize(): void {
        let x: number = this.canvas.width;
        let y: number = this.canvas.height;

        Logger.log(1, "'gl.canvas size = (" + x + "'," + y + ")");
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     trace
    //

    trace(y_mouse : number): void {

        Logger.log(1, "trace at y = " + y_mouse);

        const
            screen_y : number = y_mouse;

        const
            content_y : number = (screen_y - this.offsetY) / this.y_scale;

        const
            row : number = content_y / this.row_size;

            Logger.log(5, "'trace at screen y = " + screen_y + "' gives row = " + row);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     handleMouseUp
    //

    handleMouseUp = (event: any) => {

        if (event.button !== 0) {
        return;
        }

        this.isDragging = false;

        this.offsetX += (this.x_current! - this.x_down!);
        this.offsetY += (this.y_current! - this.y_down!);

        Logger.log(1, "'handleMouseUp delta (" + (this.x_current! - this.x_down!) + "'," + (this.y_current! - this.y_down!) + "')");

        // requestAnimationFrame(this.cbRender);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     handleMouseMove
    //

    private handleMouseMove = (event: any) => {

        const rect : ClientRect = this.canvas.getBoundingClientRect();

        this.x_current = event.clientX - rect.left;
        this.y_current = event.clientY - rect.top;

        if (this.isDragging) {
            // requestAnimationFrame(this.cbRender);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     handleKeyDown
    //

    handleKeyDown = (event: any) => {

        Logger.log(5, "keycode = " + event.keyCode);

        const viz_factor1_old : number = this.viz_factor1;
        const viz_factor2_old : number = this.viz_factor2;

        const viz_change_factor : number = 0.05;

        if (event.keyCode === 81) {
            this.viz_factor1 -= viz_change_factor;
        } else if (event.keyCode === 87) {
            this.viz_factor1 += viz_change_factor;
        }

        if (event.keyCode === 65) {
            this.viz_factor2 -= viz_change_factor;
        } else if (event.keyCode === 83) {
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

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     GetVizFactor1
    //

    GetVizFactor1(): number {
        return this.viz_factor1;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     SetVizFactor1
    //

    SetVizFactor1(factor: number): void {
        this.viz_factor1 = factor;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     GetVizFactor2
    //

    GetVizFactor2(): number {
        return this.viz_factor2;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c     SetVizFactor2
    //

    SetVizFactor2(factor: number): void {
        this.viz_factor2 = factor;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     handleMouseDown
    //

    handleMouseDown = (event: any) => {

      if (event.button !== 0) {
        return;
      }

      const rect : ClientRect = this.canvas.getBoundingClientRect();

      this.isDragging = true;

      this.x_down = event.clientX - rect.left;
      this.y_down = event.clientY - rect.top;

      this.trace(this.y_down);

      this.x_current = this.x_down;
      this.y_current = this.y_down;

      this.logCanvasSize();

      // display height extent in world space:

      const
        row0_new : number = this.get_row_min();

      const
        row1_new : number = this.get_row_max();

      Logger.log(1, "'Rows on display2: [" + row0_new + "," + row1_new + "]");
      Logger.log(1, "'handleMouseDown at " + this.x_down + "," + this.y_down + ")");
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     handleMouseWheel
    //

    handleMouseWheel = (event: any) => {

        const rect : ClientRect = this.canvas.getBoundingClientRect();

        const y_mouse : number = event.clientY - rect.top;

        const d : number = event.wheelDelta;

        let y_scale_new : number;

        const y_scale_current : number = (this.y_scale_optimal === 0) ? this.y_scale : this.y_scale_optimal;

        if (d < 0) {
            y_scale_new = y_scale_current * this.wheel_scale_factor;
        } else {
            y_scale_new = y_scale_current / this.wheel_scale_factor;
        }

        this.y_scale_optimal = y_scale_new;
        this.y_scale_optimal_mouse = y_mouse;

        Logger.log(1, "'handleMouseWheel'");
        // requestAnimationFrame(this.cbRender);
    }

    //////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_offset
    //

    animate_y_offset(): void {

        let
          diff : number = this.getOffsetY() - this.offsetY_anim;

        const
          N : number = this.y_anim_speed_factor;

        diff = (N - 1) * diff / N;

        if (Math.abs(diff) < this.y_anim_snap_threshold) {
            this.offsetY_anim = this.getOffsetY();
        } else {
            this.offsetY_anim = this.getOffsetY() - diff;
            // requestAnimationFrame(this.cbRender);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     set_y_scale_and_adjust_offset
    //

    set_y_scale_and_adjust_offset(y_scale_new : number, y_mouse : number): void {

        const
            content_y0 : number = (y_mouse - this.offsetY) / this.y_scale;

            this.y_scale = y_scale_new;

        this.offsetY = y_mouse - content_y0 * this.y_scale;

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_end_and_stop
    //

    animate_y_end_and_stop(): void {

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

    getOffsetY(): number {

        if (this.isDragging) {
            return (this.offsetY + (this.y_current! - this.y_down!))/ this.y_scale;
        } else {
            return this.offsetY/ this.y_scale;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getCurrentY
    //

    getCurrentY(): number {
        return this.y_current!;
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     animate_y_scale
    //
    animate_y_scale(): void {

        if (this.y_scale_optimal === 0) {
            return;
        }

        let
            y_diff : number = this.y_scale - this.y_scale_optimal;

        const
            N : number = 7;

        y_diff = (N-1) * y_diff / N;

        const
            y_scale_new : number = y_diff + this.y_scale_optimal;

        if (Math.abs(y_diff) < this.y_anim_snap_threshold) {
            console.log("'Animation met threshold");
            this.animate_y_end_and_stop();
        } else {
            this.set_y_scale_and_adjust_offset(y_scale_new, this.y_scale_optimal_mouse);
            // requestAnimationFrame(this.cbRender);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     get_row_min
    //

    get_row_min(): number {

      let
        rOffsetYScaled : number = this.getOffsetY();

      let
        frow0 : number = -rOffsetYScaled;

      frow0 = frow0 / this.row_size;

      let
      row0 : number = Math.round(frow0) - 1;

      if (row0 < 0) {
        row0 = 0;
      }

      return row0;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     get_row_max
    //

    get_row_max(): number {

        let
            rOffsetYScaled: number = this.getOffsetY();

        let
            frow1: number = this.gl.canvas.height / this.y_scale - rOffsetYScaled;

        frow1 = frow1 / this.row_size;

        let
            row1: number = Math.round(frow1) + 1;

        if (row1 < 0) {
            row1 = 0;
        }

        return row1;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     resize
    //

    resize(): void {

        // lookup the size the browser is displaying the canvas.

        let displayWidth: number = this.canvas.clientWidth;
        let displayHeight: number = this.canvas.clientHeight;

        // check if the canvas is not the same size.

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {

            // make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    animate(): void {
        this.animate_y_offset();
        this.animate_y_scale();
    }

}






