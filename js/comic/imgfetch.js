

// https://raw.githubusercontent.com/EvcHouse/blog-comic_pic/main/comic/imglist/yzsc/32301438_p0.webp
// 配置信息
const owner = "EvcHouse";
const repo = "blog-comic_pic";
const branch = "main";
const path = "comic/imglist/k_on/6149d0521a778.webp";

// 链接模板（修正了你原本的语法错误）
let zoneLinks = [
    "https://<<owner>>.github.io/<<repo>>/<<path>>",
    "https://github.com/<<owner>>/<<repo>>/raw/<<branch>>/<<path>>",
    "https://cdn.jsdelivr.net/gh/<<owner>>/<<repo>>@<<branch>>/<<path>>",
    "https://cdn.statically.io/gh/<<owner>>/<<repo>>@<<branch>>/<<path>>",
    "https://jsd.cdn.zzko.cn/gh/<<owner>>/<<repo>>@<<branch>>/<<path>>",
    "https://raw.githubusercontent.com/<<owner>>/<<repo>>/<<branch>>/<<path>>"
]

// 替换链接模板变量
function buildUrl(link) {
    return link
        .replace(/<<owner>>/g, owner)
        .replace(/<<repo>>/g, repo)
        .replace(/<<branch>>/g, branch)
        .replace(/<<path>>/g, path);
}

// // 检测单个链接是否可用, 添加时长统计
// // 增加超时截止功能
// async function checkLink(url) {
//     try {
//         console.info(`🔍 检查链接: ${url}`);
//         const startTime = performance.now();
//         const res = await fetch(url, { method: "HEAD" });
//         const endTime = performance.now();
//         console.info(`⏱️ 耗时: ${endTime - startTime} ms`);
//         if (res.ok) {
//             console.info(`✅ 可用链接: ${url}`);
//             return [true, endTime - startTime];
//         }
//     } catch (err) {
//         console.warn(`❌ 无效链接: ${url}`);
//     }
//     return [false, -1];
// }

// 检测单个链接是否可用, 添加时长统计 + 超时控制
async function checkLink(url) {
    try {
        console.info(`🔍 检查链接: ${url}`);
        const startTime = performance.now();

        // 👇 增加超时控制（5000ms = 5秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            method: "HEAD",
            signal: controller.signal // 绑定超时信号
        });

        clearTimeout(timeoutId); // 清除定时器
        const endTime = performance.now();

        console.info(`⏱️ 耗时: ${endTime - startTime} ms`);
        if (res.ok) {
            console.info(`✅ 可用链接: ${url}`);
            return [true, endTime - startTime];
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            console.warn(`⏹️ 超时链接: ${url}`);
        } else {
            console.warn(`❌ 无效链接: ${url}`);
        }
    }
    return [false, -1];
}

// 主函数：批量检测并返回可用链接
// 改动一下：全部反应完了后，再来一个callback

async function getValidLinks() {
    const validLinks = [];
    let lastResponseTime = Infinity;
    for (const link of zoneLinks) {
        const url = buildUrl(link);
        const [isValid, loadTime] = await checkLink(url);
        if (isValid) {
            if (loadTime < lastResponseTime) {
                lastResponseTime = loadTime;
                validLinks.unshift(url); // 添加到列表开头
            } else{
                validLinks.push(url); // 添加到列表末尾
            }
        }
    }
    console.log("\n🎯 最终可用链接列表：", validLinks);
    return validLinks;
}


// 核心：全部检测完 → 执行 callback
async function getValidLinksWithCallback(callback) {
    const validLinks = [];
    let lastResponseTime = Infinity;
    
    for (const link of zoneLinks) {
        const url = buildUrl(link);
        const [isValid, loadTime] = await checkLink(url);
        
        if (isValid) {
            if (loadTime < lastResponseTime) {
                lastResponseTime = loadTime;
                validLinks.unshift(link);
            } else {
                validLinks.push(link);
            }
        }
    }

    console.log("\n🎯 所有链接检测完毕！");
    console.log("📶 按速度排序的可用链接：", validLinks);

    // ✅ 全部完成后才调用回调函数
    if (typeof callback === "function") {
        callback(validLinks);
    }

    return validLinks;
}


// 执行
// getValidLinks();

// let a = 1;

export { getValidLinks, getValidLinksWithCallback };