const txtSuf = ["txt", "c", "h", "cpp", "cxx", "hpp", "hpp", "cs", "css", "go", "htm", "html", "java", "js", "kt", "kts", "ktm", "m", "mm", "pas", "pl", "php", "py", "rb", "rs", "ts", "xml", "yml", "yaml", "json"];
const imgSuf = ["bmp", "jpg", "jpeg", "jfif", "png", "gif", "svg", "webp", "ico"];
function loadImg(path) {
    document.getElementById("view").innerHTML = `<img src="/api/gh/get?path=${path}&method=file" class="mdui-img-rounded mdui-center">`;
    mdui.mutation();
}
function loadTxt(path) {
    $.ajax({
        url: `/api/gh/get?path=${path}&method=file`,
        type: "GET",
        dataType: "text",
        success: function(response, status, jqXHR) {
            document.getElementById("view").innerHTML = `<pre><code>${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
            hljs.highlightAll();
        },
        error: function(jqXHR, status, error) {
            console.error(`Get resource error: ${error}`);
        },
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const qry = getQryJson();
    if (!("path" in qry)) {
        document.getElementById("view").innerHTML = "<center><span style=\"color: #f00;\"><b>请指定文件路径！</b></span></center>"
        mdui.mutation();
    }
    const path = qry.path;
    const fname = decodeURIComponent(path).split("/").pop();
    const suf = (fname.indexOf(".") === -1 ? null : fname.split(".").pop());
    loadPathShow(path);
    if (imgSuf.includes(suf)) {
        loadImg(path);
    } else if (txtSuf.includes(suf)) {
        loadTxt(path);
    } else {
        document.getElementById("view").innerHTML = "<center><span>未知文件，<button class=\"mdui-btn mdui-ripple\" id=\"btn-view-as-text\">点我</button>以文本形式预览</center>";
        document.getElementById("btn-view-as-text").addEventListener("click", () => {
            document.getElementById("view").innerHTML = "<center><div class=\"mdui-spinner mdui-spinner-colorful\"></div></center>";
            mdui.mutation();
            loadTxt(path);
        });
        mdui.mutation();
    }
});