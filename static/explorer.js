const dirHTML = `<tr path="%DIRPATH%" type="dir">
    <td><a href="?path=%DIRPATH%">%DIRNAME%</a></td>
    <td>文件夹</td>
    <td>/</td>
</tr>`;
const fileHTML = `<tr path="%FILEPATH%" type="file">
    <td><a href="./view.html?path=%FILEPATH%">%FILENAME%</a></td>
    <td>文件</td>
    <td>%FILESIZE%</td>
</tr>`;
const fsUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
function getFileSizeStr(size) {
    let idx = 0;
    while (size / 1024 > 1) {
        size /= 1024, idx++;
    }
    return `${size.toFixed(2)} ${fsUnits[idx]}`;
}
function loadExplorerTable(bodyHTML) {
    document.getElementById("file-table-container").innerHTML = `
    <table class="mdui-table mdui-table-hoverable mdui-table-selectable" id="file-table">
        <thead>
            <th>文件名</th>
            <th>类型</th>
            <th>大小</th>
        </thead>
        <tbody>${bodyHTML}</tbody>
    </table>`;
    mdui.mutation();
}
function getSelectedFiles() {
    const res = [];
    Array.from(document.getElementById("file-table").children[1].children).forEach((e) => {
        if (e.children[0].children[0].children[0].checked) {
            res.push([e.getAttribute("path"), e.getAttribute("type"), e.children[1].children[0].getAttribute("href")]);
        }
    });
    return res;
}
let needDel, alreadyDel;
function completeReport() {
    if (alreadyDel < needDel) {
        setTimeout(completeReport, 1000);
    } else {
        curSnackbar.close();
        curSnackbar = mdui.snackbar({
            message: "文件删除完成，即将刷新页面",
            position: "right-bottom",
            onClosed: () => {
                document.location.reload();
            }
        });
    }
}
let curSnackbar;
document.addEventListener("DOMContentLoaded", () => {
    const qry = getQryJson();
    if (!("path" in qry)) {
        qry["path"] = "";
    }
    const path = qry.path;
    loadPathShow(path);
    $.ajax({
        url: `/api/gh/get?path=${path}&method=dir`,
        type: "GET",
        success: function(response, status, jqXHR) {
            if (!Array.isArray(response)) {
                console.error("Response is not a array");
                return;
            }
            response.sort((x, y) => {
                if (x.type !== y.type) {
                    if (x.type < y.type) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    if (x.name < y.name) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });
            let finalHTML = "";
            for (const i in response) {
                if (response[i].type === "dir") {
                    finalHTML += dirHTML.replaceAll("%DIRNAME%", response[i].name)
                                        .replaceAll("%DIRPATH%", encodeURIComponent(response[i].path));
                } else {
                    finalHTML += fileHTML.replaceAll("%FILENAME%", response[i].name)
                                         .replaceAll("%FILEPATH%", encodeURIComponent(response[i].path))
                                         .replaceAll("%FILESIZE%", getFileSizeStr(response[i].size));
                }
            }
            loadExplorerTable(finalHTML);
            document.getElementById("view-all").addEventListener("click", () => {
                const sf = getSelectedFiles();
                sf.forEach((e) => {
                    window.open(e[2]);
                });
            });
            document.getElementById("edit-all").addEventListener("click", () => {
                const sf = getSelectedFiles();
                sf.forEach((e) => {
                    if (e[1] === "file") {
                        window.open(`./edit.html?path=${e[0]}`);
                    }
                });
            });
            document.getElementById("delete-all").addEventListener("click", () => {
                mdui.dialog({
                    title: "你知道自己在干什么吗？",
                    content: "<p>删除文件意味着你将永远失去它们，很久（真的很久）！</p><p>提示：不支持删除文件夹，所以会忽略勾选的文件夹</p>",
                    buttons: [
                        {
                            text: "手滑了",
                        },
                        {
                            text: "我知道我在干什么，删除文件",
                            onClick: async () => {
                                const sf = getSelectedFiles();
                                curSnackbar = mdui.snackbar({
                                    message: "开始删除文件",
                                    position: "right-bottom",
                                });
                                needDel = 0, alreadyDel = 0;
                                sf.forEach((e) => {
                                    if (e[1] === "file") {
                                        needDel++;
                                        $.ajax({
                                            url: "/api/gh/delete",
                                            method: "POST",
                                            data: {
                                                path: decodeURIComponent(e[0]),
                                                message: `Delete file from Hemo`,
                                            },
                                            success: function(response, status, jqXHR) {
                                                curSnackbar.close();
                                                curSnackbar = mdui.snackbar({
                                                    message: `已删除 ${e[0]}`,
                                                    position: "right-bottom",
                                                });
                                            },
                                            error: function(jqXHR, status, error) {
                                                console.error(`Error when deleting ${e[0]}: ${error}`);
                                                curSnackbar.close();
                                                curSnackbar = mdui.snackbar({
                                                    message: `删除 ${decodeURIComponent(e[0])} 时出现问题：${error}`,
                                                    position: "right-bottom",
                                                });
                                            },
                                            complete: function(jqXHR, status) {
                                                alreadyDel++;
                                            },
                                        });
                                    }
                                });
                                completeReport();
                            },
                        },
                    ],
                });
            });
        },
        error: function(jqXHR, status, error) {
            console.error(`Get resource error: ${error}`);
        },
    });
});