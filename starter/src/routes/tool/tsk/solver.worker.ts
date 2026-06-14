/**
 * Off-main-thread solver. The route search is CPU-bound (state-space A*) and can take a few
 * seconds for heavily-constrained queries; running it here keeps the UI responsive instead of
 * freezing the main thread. Messages are plain data (SolveInput in, SolveOutput out), so they
 * structured-clone cleanly across the worker boundary.
 */
import { solve, type SolveInput, type SolveOutput } from '@5argon/arkham-tsk-solver';

interface Request {
	id: number;
	input: SolveInput;
}

self.onmessage = (e: MessageEvent<Request>) => {
	const { id, input } = e.data;
	let result: SolveOutput;
	try {
		result = solve(input);
	} catch (err) {
		result = {
			ok: false,
			proof: {
				kind: 'logical',
				conflict: err instanceof Error ? err.message : 'solver error',
				cap: 0,
				breakdown: [],
				floor: 0,
				message: { id: 'impossible_logical', params: { conflict: 'solver error' } },
			},
		};
	}
	(self as unknown as Worker).postMessage({ id, result });
};
