import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// First-frame mount of the heavy three.js scene can exceed the 30 s default
// under host load (TimeoutError at frame 0, 33 s). Raised 2026-11-25.
Config.setTimeoutInMilliseconds(120000);
// 2026-11-25 ~20:00 WIB: chunk 6 died at frame 1891 (crossfade region) with
// "timeout 123000ms exceeded" — a single heavy frame can take >2 min under
// host load. Raised to 300 s so slow frames get room instead of failing.
Config.setTimeoutInMilliseconds(300000);
