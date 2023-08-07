export function getParam(key) {
    return new URLSearchParams(window.location.search).get(key)
}