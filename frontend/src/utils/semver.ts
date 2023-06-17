
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function isValidSemVer(semver: string) {
    return SEMVER_PATTERN.test(semver);
}

export function semverComponents(semver: string): [number, number, number] {
    const [major, minor, patch] = semver.split(".", 3);
    return [parseInt(major), parseInt(minor), parseInt(patch)];
}

export function semverCompare(a: string, b: string): number {
    const [majorA, minorA, patchA] = semverComponents(a);
    const [majorB, minorB, patchB] = semverComponents(b);

    if (majorA - majorB !== 0) {
        return majorA - majorB;
    }

    if (minorA - minorB !== 0) {
        return minorA - minorB;
    }

    return patchA - patchB;
}

