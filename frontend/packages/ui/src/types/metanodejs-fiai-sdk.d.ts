declare module '@metanodejs/fiai-sdk' {
  export class FiaiSDK {
    static init(options: { basePath: string }): Promise<void>
  }
}