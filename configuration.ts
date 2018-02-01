
class Configuration {

  private json_raw: any;
  private keywordToNumber: { [id: string] : number } = {};
  private numberToColorRGBA: { [id: number] : Array<number> } = {};

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     Configuration
  //

  constructor(json_raw: any) {
      this.json_raw = json_raw;

      Logger.log(1, "Configuration instantiated");

      Logger.log(1, this.json_raw);

      this.ProcessIntervalColors();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     GetBaseName
  //

  GetBaseName(): string {
    return this.json_raw.DATA.BASENAME;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     GetNumberOfChunks
  //

  GetNumberOfChunks(): number {
    return this.json_raw.DATA.CHUNKS;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     GetRGBAForType
  //

  GetRGBAForType(interval_type: string): Array<number> {

    if (this.json_raw.INTERVALS[interval_type] == null) {
      const a : Array<number> = this.json_raw.ERRORCOLOR as Array<number>;
      return a;
    } else {
      const a : Array<number> = this.json_raw.INTERVALS[interval_type].FILLCOLOR as Array<number>;
      return a;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     ProcessIntervalColors
  //

  ProcessIntervalColors(): void {

    let keyID : number = 0;

    for(let key in this.json_raw.INTERVALS) {
      if (this.json_raw.INTERVALS.hasOwnProperty(key)) {
        const mykey: string = key;
        let value: any = this.json_raw.INTERVALS[key];

        Logger.log(1, "id = " + keyID + ", key = " + key + ", value = " + value);

        const color: Array<number> = value.FILLCOLOR;
        Logger.log(1, "   title = " + value.TITLE);

        Logger.log(1, "   palette color# " + keyID + " is color " + color);

        this.keywordToNumber[mykey] = keyID;
        this.numberToColorRGBA[keyID] = color;

        keyID++;
      }
    }

    // c Add system color
    const error_key: string = "SYSTEM";
    this.keywordToNumber[error_key] = keyID;
    this.numberToColorRGBA[keyID] = new Array(0, 0, 0, 55);

    keyID++;

  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     GetKeywordToNumberMap
  //

  GetKeywordToNumberMap(): { [id: string] : number } {
    return this.keywordToNumber;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // c     GetNumberToColorRGBA
  //

  GetNumberToColorRGBA(): { [id: number] : Array<number> } {
    return this.numberToColorRGBA;
  }


}


