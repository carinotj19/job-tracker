// Type definitions for @pinia/testing
declare module '@pinia/testing' {
  import { Pinia } from 'pinia'
  
  interface TestingOptions {
    createSpy?: Function
    stubActions?: boolean
    stubPatch?: boolean
    fakeApp?: boolean
    initialState?: Record<string, any>
  }
  
  export function createTestingPinia(options?: TestingOptions): Pinia
} 