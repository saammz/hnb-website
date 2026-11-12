export async function mockEmrHandshake({ verification }) {
  // shortcut: replace this mock with the authenticated EMR call when its contract is available.
  return {
    status: 'success',
    booking_reference: `MOCK-${verification.reference}`,
    simulated: true,
  };
}
