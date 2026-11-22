export function isPreviewMock(): boolean {
  return import.meta.env.VITE_PREVIEW === 'mock'
}