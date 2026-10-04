import type { ArgumentDef } from '../kernel/types';

/**
 * The method of doubt, Meditations I–III (1641).
 *
 * The point being made: the machinery everybody remembers — the dream, the
 * demon — carries none of the weight of the conclusion everybody quotes. The
 * cogito rests on two unglamorous premises and nothing else, and you can only
 * really see that by refusing the famous ones and watching the conclusion
 * refuse to move. Prose cannot show this, because prose gives every premise
 * the same apparent weight.
 *
 * Two things this layout is honest about rather than quiet about. Setting the
 * cogito out as a claim resting on premises is a reading Descartes explicitly
 * rejected — so the objection that says so is included, aimed at the premise
 * in question. And the reasoning is carried three claims past the cogito, to
 * the truth rule, because that is where the objection that actually damaged
 * him lands.
 *
 * Claim texts follow Cottingham's phrasing where they quote; the objections
 * and replies follow Bennett's translation of the 1641 Objections and Replies.
 */

const methodOfDoubt: ArgumentDef = {
  id: 'method-of-doubt',
  title: 'The method of doubt',
  thesis:
    'Refuse everything that admits of the least doubt, and see what — if anything — is left standing.',

  claims: [
    // ---- What you are asked to grant ------------------------------------
    {
      id: 'senses-deceive',
      kind: 'premise',
      text: 'The senses sometimes deceive me — about small or distant things, at the very least.',
      cite: 'Meditation I',
    },
    {
      id: 'never-trust-a-deceiver',
      kind: 'premise',
      text: 'It is prudent never to place complete trust in what has deceived us even once.',
      cite: 'Meditation I',
      note: 'The load is carried here rather than by the previous premise. Sceptics before Descartes had the fallibility of the senses; the policy of treating a single failure as disqualifying is what turns it into a demolition tool.',
    },
    {
      id: 'no-waking-mark',
      kind: 'premise',
      text: 'There are never any sure signs by which being awake can be distinguished from being asleep.',
      cite: 'Meditation I',
    },
    {
      id: 'powerful-deceiver',
      kind: 'premise',
      text: 'My origin lies in something that could have made me go wrong even in what seems most evident: an omnipotent God, or "some malicious demon of the utmost power and cunning", or simply a nature too imperfect to be relied on.',
      cite: 'Meditation I',
      note: 'The demon is theatre, and optional. Descartes notes that supposing a weaker origin makes the doubt worse, not better — the less powerful my cause, the likelier that I am imperfect enough to be wrong all the time. What is being doubted is my faculties, not a villain.',
    },
    {
      id: 'i-am-thinking',
      kind: 'premise',
      text: 'I am thinking — right now, in putting these very questions, and in being deceived if I am.',
      cite: 'Meditation II',
    },
    {
      id: 'thinking-is-not-nothing',
      kind: 'premise',
      text: 'Whatever thinks is not nothing.',
      cite: 'Meditation II',
      note: 'Stating this as a premise is already to take a side. Descartes denied that the cogito needs a general truth above it, and the objection below is his critics pressing exactly this point.',
    },

    // ---- The demolition --------------------------------------------------
    {
      id: 'senses-suspended',
      kind: 'step',
      text: 'Everything I have accepted on the authority of the senses is set aside as doubtful.',
      from: ['senses-deceive', 'never-trust-a-deceiver'],
      move: 'Applying the policy to the whole class at once instead of case by case.',
      cite: 'Meditation I',
      note: 'Descartes later defends the wholesale treatment with a basket of apples: you tip the lot out rather than inspect each one, because the point is to stop rot spreading (Seventh Replies).',
    },
    {
      id: 'body-suspended',
      kind: 'step',
      text: 'Even that I am sitting here, in a dressing gown, holding this paper, may be false. I may have no hands, and no body at all.',
      from: ['no-waking-mark'],
      move: 'The dream reaches what the first doubt could not: not the distant and the small, but what is closest and most vivid.',
      cite: 'Meditation I',
    },
    {
      id: 'arithmetic-suspended',
      kind: 'step',
      text: 'Even arithmetic and geometry are doubtful — that two and three make five, that a square has four sides.',
      from: ['powerful-deceiver'],
      move: 'Only a defect in the faculty itself can reach these, which is why the deceiver has to be introduced.',
      cite: 'Meditation I',
      note: 'Dreaming leaves mathematics standing — "whether I am awake or asleep, two and three added together are five". This is the exact join where the first Meditation needs a second kind of doubt, and the reason the demon is there at all.',
    },
    {
      id: 'nothing-survives',
      kind: 'step',
      text: 'Nothing I formerly took myself to know is beyond doubt.',
      from: ['senses-suspended', 'body-suspended', 'arithmetic-suspended'],
      cite: 'Meditation I',
    },
    {
      id: 'demon-cannot-annihilate',
      kind: 'step',
      text: 'Let the deceiver do his worst: he can never bring it about that I am nothing, so long as I think that I am something.',
      from: ['powerful-deceiver', 'i-am-thinking'],
      move: 'Turning the deceiver against himself — deceiving me is something done to someone.',
      cite: 'Meditation II',
      note: 'This is the route everyone remembers, and it is worth watching what happens to it, and to the conclusion below it, when you refuse the deceiver.',
    },

    // ---- What is left ----------------------------------------------------
    {
      id: 'i-exist',
      kind: 'conclusion',
      text: 'I am, I exist — necessarily true whenever I put it forward, or conceive it in my mind.',
      from: ['i-am-thinking', 'thinking-is-not-nothing'],
      move: 'Not, Descartes insists, a deduction from a general rule, but one thing seen in a single act of attention.',
      cite: 'Meditation II',
      note: 'The famous sentence is not here. The Meditations says "ego sum, ego existo"; "je pense, donc je suis" is the Discourse of 1637, and the Latin "ego cogito, ergo sum" first appears in the Principles of 1644.',
    },
    {
      id: 'only-thought-will-serve',
      kind: 'step',
      text: 'Thought is the only one of my acts that will serve as the premise: I may dream that I walk, but I cannot merely seem to think.',
      from: ['no-waking-mark', 'i-am-thinking'],
      cite: 'Meditation II; argued out in the Fifth Replies',
    },
    {
      id: 'thinking-thing',
      kind: 'conclusion',
      text: 'In the strict sense, then, I am only a thing that thinks — a mind, or intelligence, or intellect, or reason.',
      from: ['i-exist', 'nothing-survives'],
      move: 'Everything that did not survive the demolition is refused a place in what the "I" is.',
      cite: 'Meditation II',
      note: '"In the strict sense" is doing real work. The claim at this stage is only that nothing bodily has yet been shown to belong to the I — not that the I is incorporeal. Descartes says he leaves that undecided until Meditation VI, and this is where the argument stops being safe.',
    },
    {
      id: 'truth-rule',
      kind: 'conclusion',
      text: 'So I seem able to lay it down as a general rule that whatever I perceive very clearly and distinctly is true.',
      from: ['i-exist'],
      move: 'Reading the mark of certainty off the one belief that survived, then generalising from it.',
      cite: 'Meditation III',
      note: 'The hedge is Descartes\'s own — "I now seem to be able". The rule is not established until Meditation IV, and only after God has been proved not to be a deceiver. Which is what Arnauld noticed.',
    },
  ],

  objections: [
    {
      id: 'gassendi-machinery',
      target: 'powerful-deceiver',
      who: 'Pierre Gassendi, Fifth Objections (1641)',
      text: 'Why not say simply and briefly that you were treating your previous knowledge as uncertain? That would have spared you the need to imagine a deceiving God or an evil Spirit, and let you point instead to the darkness of the human mind or the weakness of our nature. Say what you will, no one will believe you have really convinced yourself.',
      reply:
        'That would be to do the job perfunctorily. "Is it really so easy to free ourselves from all the errors we have soaked up since our infancy? Is it possible to be too careful in carrying out a project that everyone agrees should be pursued?" A philosopher who says these matters need not be doubted owes a reason, and there is none. And "the darkness of the human mind" explains nothing — it is like saying we make mistakes because we are apt to go wrong.',
    },
    {
      id: 'objectors-syllogism',
      target: 'thinking-is-not-nothing',
      who: 'The Second Objectors (Mersenne and others), 1641; pressed again by Gassendi',
      text: 'Then the cogito is a syllogism with its major premise suppressed — "whatever thinks exists" — and you have helped yourself to precisely the kind of general truth you claimed to have thrown out.',
      reply:
        'One "does not deduce existence from thought by means of a syllogism, but recognizes it as something self-evident by a simple intuition of the mind". The general proposition is learned from the particular case, not the case from it — and someone who had never asked whether whatever thinks exists would still be unable to doubt his own existence while thinking.',
    },
    {
      id: 'gassendi-any-act',
      target: 'only-thought-will-serve',
      who: 'Pierre Gassendi, Fifth Objections (1641)',
      text: 'You did not need all this apparatus, having been rightly certain on other grounds that you existed. You could have made the same inference from any one of your other actions, since it is known by the natural light that whatever acts exists.',
      reply:
        'Not so. "I can\'t say I am walking, therefore I exist, except by adding to my walking my awareness of walking, which is a thought." It can happen in dreams that I seem to myself to be walking and am really not doing so. From the fact that I think I am walking I can infer a mind that thinks — but not a body that walks.',
    },
    {
      id: 'hobbes-thinking-thing',
      target: 'thinking-thing',
      who: 'Thomas Hobbes, Third Objections (1641)',
      text: '"I am thinking, therefore I am thought" no more follows than "I am walking, therefore I am a walk". Every philosopher distinguishes a subject from its acts. And since the subject of an act can be understood only in terms of a body — as the wax example itself shows — the thing that thinks may well be something corporeal. Descartes assumes it is not, and does not prove it.',
      reply:
        '"There is no comparison here between a walk and thought": a walk is only the act, whereas "thought" is taken sometimes for the act, sometimes for the faculty, sometimes for the thing that has it. Hobbes is right that we cannot conceive an act without its subject — but the subject of an act must be understood as a substance, and it does not follow that it must be understood as a body. "I didn\'t assume it, nor did I base my argument on it. I left it quite undecided until the sixth Meditation."',
    },
    {
      id: 'arnauld-circle',
      target: 'truth-rule',
      who: 'Antoine Arnauld, Fourth Objections (1641)',
      text: 'How is this not reasoning in a circle? We are sure that whatever we clearly and distinctly perceive is true only because we know that God exists — and we can be sure that God exists only because we clearly and distinctly perceive it.',
      reply:
        'Distinguish perceiving something clearly from remembering having perceived it clearly. While we attend to the arguments we are certain; afterwards, all we need in order to stay certain is the memory that we did earlier perceive it clearly — "this memory wouldn\'t be sufficient if we didn\'t know that God exists and isn\'t a deceiver".',
    },
  ],

  notice:
    'Refuse the dream. Refuse the demon. The conclusion does not move. The two premises actually carrying it are the two least quotable lines in the whole of Meditations I and II, and the sceptical machinery that made Descartes famous makes the conclusion striking rather than supported — which is a fact about the argument\'s shape, not a matter of opinion about its force. Then look at what does come down. Reject the dream and you lose the thinking thing, because that claim needs the demolition to have been total; Hobbes went after it, and Descartes conceded the ground by saying he had left the question open until Meditation VI. And the rule at the bottom — the one that has to hold if any of the rest of the Meditations is to work — is where Arnauld found the circle, and where the argument has been under repair ever since.',
};

export default methodOfDoubt;
