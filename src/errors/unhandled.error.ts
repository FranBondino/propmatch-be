export class UnhandledError {
  private message: string

  private url: string

  private stack: any

  private aditionalData: string

  constructor(err: any, url: string) {
    const res: any = err?.getResponse && err?.getResponse()

    this.message = err.message
    this.url = url
    this.stack = err.stack
    this.aditionalData = res?.error
  }

  public display() {
    return JSON.stringify({
      url: this.url,
      message: this.message,
      aditionalData: this.aditionalData,
      stack: this.stack,
    })
  }
}
