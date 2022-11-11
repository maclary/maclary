/** Flatten an object where each property key is the path to the value. */
export function flattenTree(object: Record<string, any>, separator = '.') {
    const result: Record<string, any> = {};
    const stack = Object.entries(object).map(([key, value]) => ({ key, value }));

    while (stack.length > 0) {
        const { key, value } = stack.pop()!;
        if (typeof value === 'object' && value !== null) {
            for (const [subKey, subValue] of Object.entries(value)) {
                stack.push({ key: `${key}${separator}${subKey}`, value: subValue });
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}
