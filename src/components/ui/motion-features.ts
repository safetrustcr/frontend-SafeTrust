import { domAnimation } from "motion/react";

// Lazily loaded motion feature set (chunk: motion-features).
// Keep this as the single default export so LazyMotionProvider can
// dynamically import it; the reduced-motion e2e test relies on this chunk
// being split out of the main bundle.
export default domAnimation;
