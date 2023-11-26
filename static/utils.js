const m$ = mdui.$;
function getQryJson() {
    const sp = new URLSearchParams(document.location.search);
    const rs = {};
    for (const [key, value] of sp) {
        rs[key] = value;
    }
    return rs;
}