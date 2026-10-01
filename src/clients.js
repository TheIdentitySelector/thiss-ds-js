import "./discovery"
import {PersistenceService} from "./persist"

export * from "./discovery"
export * from "./persist"

// The bundled post-robot, pinned to the wire dialect of the persistence
// services (see scripts/pin-post-robot-key.sh). Integrators that talk to the
// persistence service directly must use this instance, not their own install.
export {default as postRobot} from "post-robot"
