const ptPathHTML = "<a class=\"mdui-text-color-theme-accent\" href=\"./explorer.html?path=%PATH%\">%PTPATH%</a>"
const joinHTML = "<i class=\"mdui-icon material-icons\">chevron_right</i>"
function loadPathShow(path) {
    const route = path.split("/");
    const finalList = [];
    for (let i = 0; i < route.length; i++) {
        finalList.push(ptPathHTML.replaceAll("%PTPATH%", (i > 0 ? route[i - 1] : "根目录"))
                                 .replaceAll("%PATH%", encodeURIComponent(route.slice(0, i).join("/"))));
    }
    finalList.push(route.pop());
    const finalHTML = finalList.join(joinHTML);
    document.getElementById("path-show").innerHTML = finalHTML;
    mdui.mutation();
}