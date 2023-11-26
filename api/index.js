const express = require("express");
const mongo = require("mongodb");
const octokit = require("octokit");
const path = require("path");
const crypto = require("crypto");

const owner = process.env.owner;
const repo = process.env.repo
const branch = process.env.branch;
const token = process.env.token;
const dburl = process.env.dburl;
const dbname = process.env.dbname;
const username = process.env.username;
const password = process.env.password;
const cid_ex = parseInt(process.env.cid_ex);

const octo = new octokit.Octokit({
    auth: token,
});
async function gh_commit(msg, data) {
    /*
    msg: "commit message"
    data: [
        {
            "path": "pathname",
            "content": "content(base64)" | null,
        },
        ...
    ]
    */
    // 1. get ref
    const ref = await octo.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
    });
    // 2. get commit
    const commit = await octo.rest.git.getCommit({
        owner,
        repo,
        commit_sha: ref.object.sha,
    });
    // 3. create blobs
    const blobs = [];
    for (const e of data) {
        if (e.content) {
            const blob = await octo.rest.git.createBlob({
                owner,
                repo,
                content: e.content,
                encoding: "base64",
            });
            blobs.push({
                path: e.path,
                mode: "100644",
                type: "blob",
                sha: blob.sha,
            });
        } else {
            blobs.push({
                path: e.path,
                mode: "100644",
                type: "blob",
                sha: null,
            });
        }
    }
    // 4. create tree
    const tree = await octo.rest.git.createTree({
        owner,
        repo,
        tree: blobs,
        base_tree: commit.tree.sha,
    });
    // 5. create commit
    const new_commit = await octo.rest.git.createCommit({
        owner,
        repo,
        message: msg,
        tree: tree.sha,
        parents: [
            commit.sha,
        ],
    });
    // 6. update ref
    const upd_ref = await octo.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: new_commit.sha,
        force: true,
    });
    // done!
}

function randomHex(l) {
    return crypto.randomBytes(l).toString('hex');
}
function getHash(algo, ...s) {
    const h = crypto.createHash(algo);
    s.forEach((e) => {
        h.update(e);
    });
    return h.digest("hex");
}

const app = express();

const port = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`App started on port ${port}`);
    });
}

module.exports = app;