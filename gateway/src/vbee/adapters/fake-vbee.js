export class FakeVbeeAdapter {
  async synthesize(job) {
    return {
      adapter: 'fake',
      requestId: `fake-${job.id}`,
      metadata: {
        note: 'M0 fake adapter does not call Vbee'
      }
    };
  }
}
