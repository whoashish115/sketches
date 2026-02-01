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
13. [hue drift paths](13/)
14. [blade study](14/)
15. [revolving blades](15/)
16. [night bloom](16/)
17. [void garden](17/)
18. [bouncing orbs](18/)
19. [pink ribbons](19/)
20. [ring garden](20/)
21. [ring garden indigo](21/)
22. [moss blobs](22/)
23. [organic shells](23/)
24. [soft gradient blobs](24/)
25. [ethereal flux](25/)
26. [bitwise glitch](26/)
27. [radial gradient shapes](27/)
28. [dotted flow field](28/)
29. [recursive subdivision](29/)
30. [penrose tiling](30/)
31. [chaotic penrose](31/)

## license

MIT, see [LICENSE](LICENSE).
