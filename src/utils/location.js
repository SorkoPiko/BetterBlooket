export function getParam(key) {
    let params = window.location.search.substring(1).split("&")
    for (let i = 0; i < params.length; i++) {
        const [param, value] = params[i].split("=");
        if (param === key) return value;
    }
    return false;
}