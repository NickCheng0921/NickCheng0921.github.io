# WAVeform Visualizer
Visualizer for *.wav files, built with Three.js and fft-js.

## Demo

Apologies for the gif quality, this was made w/ a screen capture using recordit.

![Demo Gif](./demo/usage.gif)

## Process

User uploaded *.wav file is converted to a spectrogram through STFT. Hanning window is used along with the fft-js library for STFT.

Spectrogram is then rendered to a texture w/ dimensions frequency and time, which is UV mapped onto the plane to create height.

## Modify

Modifications to the program should be done in the main.js file, then some bundler should be used to generate a bundled js file.

The command I used to bundle was "npx browserify -p esmify main.js -o bundle.js". Esmify is needed as I mixed two JS import standards, and the bundling has to be performed as the fft-js library was written w/ node js, and has to be bundled in order to run locally w/o a server.

## Known Issues

The timeupdate event on the audioplayer fires intermittently depending on system load, leading to small timing inconsistencies between the visualizer and actual audio being played.

During testing, this amount was found to be <3% of the original track length, which means the visualizer should function acceptably for smaller *.wav files. 