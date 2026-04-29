---
layout: post
title:  "Monte Carlo State-Value Estimation for BlackJack"
date:   2026-4-28 00:07:45 -0700
categories: Monte Carlo Python Blackjack Reinforcement Learning
---
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

I've been looking into reinforcement learning lately to create a [racing agent](https://github.com/NickCheng0921/GodotRLRacer). 

As part of this process, I'm reading **Reinforcement Learning: An Intro 2nd Edition** by Sutton & Barto as my background in ML is supervised/unsupervised learning ([blind source separation](https://github.com/NickCheng0921/BandSplitRNN-Pytorch), [variance pretraining](https://oaktrust.library.tamu.edu/server/api/core/bitstreams/1e4c3130-48ee-4356-955d-b82f1ed548ed/content)). It's not too useful for my project implementation as I'm experimenting with newer methods like PPO and reward design, but it helps me build a stronger foundation and intuition.

Chapter 5 (Monte Carlo Methods) shows an interesting looking plot of the state-value estimation of an arbitrary player strategy in BlackJack. The plot tells us what the expected return is for a given state under the following strategy: player hits until >= 20 and dealer hits til >= 17.

![img](/imgs/sutton_barto_rl_mc_blackjack.png)

I wanted to try and recreate this from scratch in Python out of curiosity. Pdfs of the book float around online, such as [here](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf) (above fig from pdf pg 130).

### More Info on the Environment

Agent env is standard BJ, with rewards {1, -1, 0} for winning, losing and drawing. We assume an infinite deck, and the agent's observation space is their current hand value, whether they have a usable ace, and the visible dealer card. The environment auto hits the player to > 11 so we can't have > 1 usable ace (if you were wondering why usable ace is binary).

This gives us an observation space of 200 discrete states (Player hand value [12, 21] = 10 states, Dealer Card [A, 10] = 10 states, Usable Ace {0, 1} = 2 states). The player can hit or stand which is a discrete action of 2 states. 

The value estimation formula can be found in the core code in the next section, we estimate the value using V(state) = V(s) + (G - V(s))/N where V is the value, G is return from this state to episode end, and N is the total # of times we reached the state.

### Code

Core logic to run the MC sim is at [core.txt]({{ "/projects/monte_carlo_blackjack/core.txt" | relative_url }})

To get the plots, run [sweep.txt]({{ "/projects/monte_carlo_blackjack/sweep.txt" | relative_url }}) (you'll need core as well, rename both to .py files)

### Results

The following plot shows the value estimation improving from 1K to 50K episodes. The usable ace cases are rarer so it takes a bit longer for the values to converge.

![img](/imgs/mc_bj_1K_50K_sweep.gif)

Here's what it looks like after 500K episodes (much closer to the book image than the 50K episode one from above).

![img](/imgs/mc_bj_500K.png)

Notice how most of the plot is dark blue/purple? That means we're expected to lose at that point since our strategy of hitting til 20 is suboptimal compared to the dealer one. Let's try playing the same strategy as the dealer instead.

![img](/imgs/mc_bj_player17_sweep.gif)

![img](/imgs/mc_bj_player17_500k_sweep.gif)

Much better, the brighter colors (higher values) show that our new strategy doesn't lose as hard as before.