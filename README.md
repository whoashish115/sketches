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

1. [additive color grid](1/)
2. [particle emitters](2/)
3. [deep sea noise field](3/)
4. [low poly terrain](4/)
5. [flow field snakes](5/)
6. [ember gradients](6/)
7. [cylinder field](7/)
8. [layered circle packing](8/)
9. [desert noise tiles](9/)
10. [warm chaos](10/)
11. [confetti grid](11/)
12. [zoned circle packing](12/)

## license

MIT, see [LICENSE](LICENSE).
