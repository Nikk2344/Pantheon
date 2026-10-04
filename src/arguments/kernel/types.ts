/**
 * The contract every argument implements.
 *
 * This is the philosophy wing's answer to `sims/kernel`. A simulation shows you
 * what a discovery *means* by letting you run it. An argument does the same job
 * for a piece of reasoning: it is a plain data object — a set of claims, each
 * declaring what it rests on — and the kernel turns that into something you can
 * take apart.
 *
 * The interaction is the point. Reading an argument as prose, you cannot see
 * which of its parts are load-bearing. Here you reject a claim and watch
 * precisely what collapses with it, and what stubbornly does not. That is a
 * fact about the argument's structure, and it is very hard to convey any other
 * way — including by the author simply asserting it.
 *
 * Support is **conjunctive**: a claim stands only if every claim it cites
 * stands. Arguments with genuinely alternative routes to a conclusion should
 * express that as two steps that each reach it, not as one step with optional
 * support — which keeps the propagation rule honest and the diagram readable.
 */

export type ClaimKind =
  /** Taken as given. The things you are asked to grant. */
  | 'premise'
  /** Derived — the reasoning proper. Must cite `from`. */
  | 'step'
  /** What the argument is for. Must cite `from`. */
  | 'conclusion';

export interface Claim {
  id: string;
  kind: ClaimKind;
  /** The claim in the plainest words that keep it accurate. */
  text: string;
  /** Ids of the claims this one rests on. Premises cite nothing. */
  from?: string[];
  /** The move being made — *how* `from` gets you here. */
  move?: string;
  /** Where in the text it actually occurs. Same discipline as `sources`. */
  cite?: string;
  /** Detail worth having but not worth putting in the claim itself. */
  note?: string;
}

/**
 * A recorded historical objection.
 *
 * Pressing one rejects its target, so the reader sees the damage the objection
 * does rather than being told how serious it is. `reply` is what the author
 * actually said back, where they said anything — withheld until pressed, for
 * the same reason a re-enactment beat withholds its insight.
 */
export interface Objection {
  id: string;
  /** Id of the claim under attack. */
  target: string;
  /** Who, in which text, and when. No attribution, no objection. */
  who: string;
  text: string;
  /** The author's answer, if there was one. */
  reply?: string;
}

export interface ArgumentDef {
  id: string;
  title: string;
  /** One line: what this argument is trying to establish. */
  thesis: string;
  claims: Claim[];
  objections?: Objection[];
  /** The one thing worth noticing — mirrors `SimDef.notice`. */
  notice?: string;
}
