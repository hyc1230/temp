const greeting = {
    load(id) {
        const h = (new Date()).getHours();
        let s = "";
        if (0 <= h && h < 5) {
            s = "夜深了";
        } else if (5 <= h && h < 9) {
            s = "早上好";
        } else if (9 <= h && h < 12) {
            s = "上午好";
        } else if (12 <= h && h < 14) {
            s = "中午好";
        } else if (14 <= h && h < 18) {
            s = "下午好";
        } else if (18 <= h && h < 24) {
            s = "晚上好";
        }
        document.getElementById(id).innerHTML = s;
    },
};