"""
Overview of Env Info

State: (player_total, dealer_showing, usable_ace)
Action: 0 = stand, 1 = hit
Reward: +1 win, -1 loss, 0 draw
Player non-terminal actions give 0 reward

run w/ `python run.py 10000`
"""

import random
from collections import defaultdict
from tqdm import tqdm

# --- Environment -----------------------------------------------------------

DECK = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    10,
    10,
    10,
]  # assume infinite deck, 1 can give usable ace here


def hand_value(cards):
    """Return (hand_value, usable_ace). Ace counts as 11 if it fits, else 1."""
    total = sum(cards)
    usable = 1 in cards and total + 10 <= 21
    if usable:
        total += 10
    return total, usable


def draw_card():
    return random.choice(DECK)


def hit_until(cards, threshold):
    """Draw cards in place until hand total >= threshold."""
    while hand_value(cards)[0] < threshold:
        cards.append(draw_card())
    return cards


class BlackjackEnv:
    STAND, HIT = 0, 1
    PLAYER_AUTO_HIT_BELOW = 12
    DEALER_STAND_AT = 17

    def reset(self):
        self.player = [draw_card(), draw_card()]
        self.dealer = [draw_card(), draw_card()]
        hit_until(self.player, self.PLAYER_AUTO_HIT_BELOW)
        self.done = False
        return self._state()

    def _state(self):
        total, usable = hand_value(self.player)
        return (total, self.dealer[0], usable)

    # Player hits, then Dealer hits
    def step(self, action):
        assert not self.done, "step() called on a finished episode"
        if action == self.HIT:
            self.player.append(draw_card())
            total, _ = hand_value(self.player)
            if total > 21:
                self.done = True
                return self._state(), -1, True
            return self._state(), 0, False

        hit_until(self.dealer, self.DEALER_STAND_AT)
        p = hand_value(self.player)[0]
        d = hand_value(self.dealer)[0]
        if d > 21 or p > d:
            reward = 1
        elif p < d:
            reward = -1
        else:
            reward = 0
        self.done = True
        return self._state(), reward, True


# --- State-value function --------------------------------------------------


def default_policy(state):
    """Sutton & Barto Example 5.1: stick on 20 or 21, else hit."""
    player_total, _, _ = state
    return BlackjackEnv.STAND if player_total >= 20 else BlackjackEnv.HIT


class StateValueFunction:
    """V(s) under a fixed policy, learned by every-visit MC.

    Holds the policy it was trained on so callers can query both V and
    pi from the same object.
    """

    def __init__(self, policy=default_policy):
        self._policy = policy
        self._v = defaultdict(float)
        self._counts = defaultdict(int)

    def policy(self, state):
        return self._policy(state)

    def predict(self, state):
        """Estimated V(s). Returns 0.0 for unseen states."""
        return self._v[state]

    def update(self, state, return_):
        """Incremental running mean: V <- V + (G - V) / N."""
        self._counts[state] += 1
        self._v[state] += (return_ - self._v[state]) / self._counts[state]

    def visits(self, state):
        return self._counts[state]

    def states(self):
        return list(self._v.keys())


# --- Training loop ---------------------------------------------------------


def run_episode(env, value_fn):
    """Play one game under value_fn's policy. Returns list of (state, reward)."""
    state = env.reset()
    trajectory = []
    while True:
        action = value_fn.policy(state)
        next_state, reward, done = env.step(action)
        trajectory.append((state, reward))
        if done:
            return trajectory
        state = next_state


def train(n_episodes, value_fn=None, seed=None):
    if seed is not None:
        random.seed(seed)
    env = BlackjackEnv()
    if value_fn is None:
        value_fn = StateValueFunction()

    for _ in tqdm(range(n_episodes)):
        trajectory = run_episode(env, value_fn)
        # Every-visit MC, gamma = 1. Compute returns from the back.
        G = 0.0
        for state, reward in reversed(trajectory):
            G = reward + G
            value_fn.update(state, G)

    return value_fn


# --- Entry point -----------------------------------------------------------

if __name__ == "__main__":
    import sys

    n = int(sys.argv[1]) if len(sys.argv) > 1 else 500_000
    V = train(n, seed=0)

    print(f"Trained {n:,} episodes under default policy (stick >= 20).\n")
    for usable_label, usable in [("no usable ace", False), ("usable ace", True)]:
        print(f"V(s), {usable_label}:")
        print("    " + " ".join(f"{d:>6}" for d in ["A"] + list(range(2, 11))))
        for p in range(12, 22):
            row = [f"{V.predict((p, d, usable)):>6.2f}" for d in range(1, 11)]
            print(f"  {p:2d} " + " ".join(row))
        print()
