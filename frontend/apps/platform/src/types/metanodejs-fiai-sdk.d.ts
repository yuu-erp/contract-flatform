declare module '@metanodejs/fiai-sdk' {
  export const FiaiSDK: {
    init(opts: { basePath: string }): Promise<void>
  }
}