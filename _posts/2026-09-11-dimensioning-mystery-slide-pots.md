---
layout: post
title:  "Dimensioning Mystery Slide Pots"
date:   2026-9-11 00:00:00 -0700
categories: potentiometers hardware technical-drawings
---
I was recently working on a project involving slide potentiometers and wanted to look for a cheap source to pick up ~10 of them (only needed 5, but wanted to get some extras in case).

![amazon page image](/imgs/slidepots/amz_pg.png)

### Looking for Dimensions

After breaking them out to a breadboard and validating my initial project design, the next step required finding their dimensions for my PCB design. After looking for a while, I couldn't find any link to a datasheet on Amazon even after reviewing the original page and looking for similar components.

An online search for similar `75mm B103 slide pots` yielded a near-identical looking component with a wiring + dimensioning diagram at the [following link](https://www.sc-qixing.com/sale-41455993-b103-75mm-mixer-fader-b10k-dual-channel-straight-sliding-potentiometer-integrated-circuits.html). Some info on the page is wrong, such as the travel being 75mm when the length is 75mm and the travel is 60mm (diagram is right, table is wrong).

### Measurements + Usage

Just in case, I bought a cheap pair of Amazon calipers and averaged measurements from the 10 pots I bought, and found that there were only 2 notable differences. To use the measurements for your own project, I recommend using the manufacturer spec + my mounting lug dimensions.
 - I had the measurements for the 2 center mounting lug positions (they only use the pins)
 - The distance between the top and bottom pins are ~1mm longer from my measurements (70.8mm vs 70mm)

The diagrams of my measurements vs the vendor's are below.

![vendor measurements](/imgs/slidepots/vendor_mounting_hole_dimensions.svg)
![my measurements](/imgs/slidepots/slide_pot_dimensions.svg)

Below is a wiring diagram for a single channel of the pot (view from bottom, flipped vs measurement diagrams which are viewed from above).

![wiring diagram](/imgs/slidepots/slide_pot_single_channel_pins.svg)