
class Configuration {

  json_raw: any;

  constructor(json_raw: any) {
      this.json_raw = json_raw;

      Logger.log(1, "Configuration instantiated");

      Logger.log(1, this.json_raw);
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


}


