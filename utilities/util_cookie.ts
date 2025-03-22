export function cookie_parse(cookie_string: string): CookieStorage {
    return cookie_string.split(";").map(cookie_word => cookie_word.match(/^([^=]+)=([^=]+)/)).reduce((cookie_storage, cookie_data) => {
        if (cookie_data !== null) cookie_storage[decodeURIComponent(cookie_data[1].trim())] = decodeURIComponent(cookie_data[2].trim());
        return cookie_storage;
    }, {} as CookieStorage)
}

export type CookieStorage = {[key: string]: string};