export function log(msg: string, ...params: any[]) {
    if (process.env.NODE_ENV !== "test") {
      console.log(msg, ...params);
    }
  }
  