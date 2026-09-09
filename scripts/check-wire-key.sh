#!/bin/sh
# The post-robot wire envelope key must stay __post_robot_10_0_14__ forever,
# whatever library version is packaged: post-robot >=10 only talks to frames
# whose key is byte-identical, and deployed services, cached bundles and
# CDN-frozen integrator builds all speak 10_0_14. The installed package is
# patched to that key (see patches/); this guard fails the build if the
# produced bundle speaks anything else.
set -eu
dist=dist/thiss-ds.js
keys=$(grep -ohE '__post_robot_[0-9_]+__' "$dist" | sort -u)
if [ "$keys" != "__post_robot_10_0_14__" ]; then
    echo "wire-key check FAILED: $dist contains: $keys" >&2
    echo "expected exactly __post_robot_10_0_14__ (see patches/ and post-robot-upgrade.md in thiss-js)" >&2
    exit 1
fi
echo "wire-key check OK: $dist speaks __post_robot_10_0_14__"
