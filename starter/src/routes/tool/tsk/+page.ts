// The TSK Solver runs entirely client-side (the solver is deterministic, pure TS), so the
// page is not prerendered; shareable ?c= / ?r= links are decoded and re-solved in the browser.
export const prerender = false;
export const ssr = false;
