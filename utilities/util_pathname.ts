export function pathname_equal(pathname_a: (string | string[]), pathname_b: (string | string[])): boolean {
    const stringified_a = pathname_stringify(pathname_a);
    const stringified_b = pathname_stringify(pathname_b);
    return (stringified_a === stringified_b);
}

export function pathname_stringify(pathname_string: (string | string[])): string {
    const pathname_stringified = (((typeof pathname_string) === "string") ? (pathname_string as string) : (pathname_string as string[]).join("/"));
    return `/${pathname_tokenize(pathname_stringified).join("/")}`;
}

export function pathname_tokenize(pathname_string: string): string[] {
    return pathname_string.split(/\/+/).filter(pathname_token => (pathname_token.length > 0));
}