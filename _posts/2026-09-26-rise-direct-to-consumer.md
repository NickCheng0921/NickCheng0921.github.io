---
layout: post
title:  "Recent Experiences with Direct to Consumer Manufacturing"
date:   2026-9-26 00:00:00 -0700
categories: pcb glasses manufacturing
---

Direct to consumer manufacturing is a business model where the manufacturer sells directly to the end customer. It's different from traditional methods since no middle-man is involved, and products are commonly built to order.

I recently came across this concept when designing a circuit board and ordering a new pair of glasses. In both cases, I was surprised by how streamlined the experience was, the quality of the output and how similar the websites were to each other.

### JLCPCB Experience

I designed the circuit board w/ the help of Opus 4.8 and some external plugins and sent the design files to JLCPCB to manufacture. The design is simple, consisting of wiring up five slide pots to two ADCs in a form factor that can sit over a rpi 5 with an audio hat attached.

<div style="display: flex; justify-content: center; gap: 10px;">
  <div style="width: 40%; text-align: center;">
    <img src="/imgs/direct_to_consumer/gerberpreview.png" style="width: 100%; height: auto;" alt="gerber pcb image">
    <p><strong>Front Preview</strong></p>
  </div>
  <div style="width: 40%; text-align: center;">
    <img src="/imgs/direct_to_consumer/gerberpreviewback.png" style="width: 100%; height: auto;" alt="gerber pcb image">
    <p><strong>Back Preview</strong></p>
  </div>
</div>

There were a couple hiccups during the design process related to identifying component dimensions, running the proper router and fixing DRCs, but there were no major issues that took over a day to solve. I tested the assembled PCB after it arrived and it seats and works perfectly too.

### Zenni Experience

The glasses were a much simpler process, only requiring me to request my prescription from my optometrist (w/ PD) and enter the measurements into Zenni (a made to order glasses website) to manufacture a pair. I looked through a couple different styles and just picked a random one that caught my eye, image below.

<div style="text-align: center;">
  <img src="/imgs/direct_to_consumer/zenniglasses.png" style="width: 55%; height: auto;" alt="zenni glasses">
</div>
<br>

### Process Similarities - PCB + Glasses

**Cost**
<br>
I can't price in the PCB since I don't know any alternatives, but the glasses were pretty cheap. They cost me $28 without insurance and the PCB run cost $40 for 2 assembled + 3 PCB only. For comparison, my old glasses consistently cost ~$300. Damn.
<br>
I think there's a real argument to be made that glasses from an optometrist tend to be costlier due to name brands, multiple high quality coatings and thin lenses. However, the Zenni's work perfectly and I feel that a large amount of the cost traditionally comes from the available in-person choices forcing consumers towards pricier choices rather than addressing their needs.
<br>
<br>
**Manufacturing location**
<br>
Both are made in China. I saw a video recently about sendcutsend, a website that does small batch orders for machining and they mentioned that most metal shops in the US won't even consider taking smaller orders. US manufacturing tends to focus on huge volume + low margin (mass production), or huge profit + low volume (boutique).
<br>
I think this phenomenon comes from the high operating costs in the US, combined with the lack of easy supplier access compared to other countries such as China. Until those issues are addressed, it'll be rare to see direct to consumer fabrication located w/in the US.
<br>
Despite the geographical distance, both products arrived in ~1.5 weeks which I feel is standard for glasses anyways, even from an optometrist.
<br>
<br>
**Ease of Use**
<br>
Both websites try to make the product comparison, evaluation, and ordering process easy.
<br>
JLCPCB's website expects you to know what you're doing a bit more compared to Zenni, but it's very simple to get something working (different from use proficiently) after watching some videos and reading their help guide.
<br>
<br>
**Manufacturing Transparency**
<br>
This was my favorite part of the process and what inspired me to even document my thoughts.
<br>
After sending in the manufacturing order, both websites will show you a pipeline of what stage your order is in (grinding lenses, placing parts on the PCB, moving between warehouses). It's really fun to look at and I recall checking on the JLCPCB page multiple times a day while I was waiting for my parts to arrive.
<br>
<br>

### Future Challenges
Having used both of these sites, I think that the biggest challenge to making more and better direct to consumer products is a lack of consumer confidence. For both cases, it still felt like a bit of a leap of faith that whatever I ordered was going to work.

I think the PCB case is more understandable as this is my first venture into the field and more experienced designers would have ran a comprehensive test suite and more checks. However, I think it's a real issue that I was unsure of what size of glasses to buy + how accurate the style was going to be. The AI face measurer + styler felt a bit inaccurate and unrealistic. One potential solution could involve Zenni mailing out a paper copy of the glasses in different sizes, so customers can try them on and see how they'd look.

With that said, both websites were great and I believe that the direct to consumer market will only continue to grow, especially as the need for specialized products at cheaper prices increases. I foresee instilling consumer confidence as the biggest challenge in that regard.