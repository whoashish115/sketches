# sketches

A daily generative art practice with [p5.js](https://p5js.org/).

Every numbered folder is one self contained sketch - an `index.html` that pulls
in the shared p5 build plus a `sketch.js` with the drawing code. Nothing is
bundled and there is no build step, the whole thing is just static files.

The rule I set myself is simple: one sketch a day, and I don't go back to
polish yesterday's.

## running locally

Any static file server works. I use the Live Server extension in VS Code
(the port is pinned in `.vscode/settings.json`), but this is fine too:

```bash
python -m http.server 5501
```

Then open `http://localhost:5501/12/` to view sketch 12, and so on.

Every sketch loads `record.js`, which grabs the canvas as a webm. It starts on
load and `r` toggles it, so hit `r` once when you have the frame you want.

## sketches

| # | sketch | preview |
| --- | --- | --- |
| 1 | [additive color grid](1/) | [png](images/1.png) |
| 2 | [particle emitters](2/) | [png](images/2.png) |
| 3 | [deep sea noise field](3/) | [png](images/3.png) |
| 4 | [low poly terrain](4/) | [png](images/4.png) |
| 5 | [flow field snakes](5/) | [png](images/5.png) |
| 6 | [ember gradients](6/) | [png](images/6.png) |
| 7 | [cylinder field](7/) | [png](images/7.png) |
| 8 | [layered circle packing](8/) | [png](images/8.png) |
| 9 | [desert noise tiles](9/) | [png](images/9.png) |
| 10 | [warm chaos](10/) | [png](images/10.png) |
| 11 | [confetti grid](11/) | [png](images/11.png) |
| 12 | [zoned circle packing](12/) | [png](images/12.png) |
| 13 | [hue drift paths](13/) | [png](images/13.png) |
| 14 | [blade study](14/) | [png](images/14.png) |
| 15 | [revolving blades](15/) | [png](images/15.png) |
| 16 | [night bloom](16/) | [png](images/16.png) |
| 17 | [void garden](17/) | [png](images/17.png) |
| 18 | [bouncing orbs](18/) | [png](images/18.png) |
| 19 | [pink ribbons](19/) | [png](images/19.png) |
| 20 | [ring garden](20/) | [png](images/20.png) |
| 21 | [ring garden indigo](21/) | [png](images/21.png) |
| 22 | [moss blobs](22/) | [png](images/22.png) |
| 23 | [organic shells](23/) | [png](images/23.png) |
| 24 | [soft gradient blobs](24/) | [png](images/24.png) |
| 25 | [ethereal flux](25/) | [png](images/25.png) |
| 26 | [bitwise glitch](26/) | [png](images/26.png) |
| 27 | [radial gradient shapes](27/) | [png](images/27.png) |
| 28 | [dotted flow field](28/) | [png](images/28.png) |
| 29 | [recursive subdivision](29/) | [png](images/29.png) |
| 30 | [penrose tiling](30/) | [png](images/30.png) |
| 31 | [chaotic penrose](31/) | [png](images/31.png) |
| 32 | [shader glitch layers](32/) | [png](images/32.png) |
| 33 | [particle clusters](33/) | [png](images/33.png) |
| 34 | [particle field](34/) | [png](images/34.png) |
| 35 | [bubbles and fractals](35/) | [png](images/35.png) |
| 36 | [wave grid](36/) | [png](images/36.png) |
| 37 | [particle network](37/) | [png](images/37.png) |
| 38 | [cell colony](38/) | [png](images/38.png) |

## license

MIT, see [LICENSE](LICENSE).
