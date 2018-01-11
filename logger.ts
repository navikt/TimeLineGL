

class Logger {

    static log (pri: number, text: string): void {
        if (pri >= 5 ) {
            console.log(text);
        }
    }

}