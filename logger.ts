

class Logger {

    static log (pri: number, text: string): void {
        if (pri >= 3 ) {
            console.log(text);
        }
    }

}