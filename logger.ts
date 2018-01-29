

class Logger {

    static log (pri: number, text: string): void {
        if (pri >= 1 ) {
            console.log(text);
        }
    }

}