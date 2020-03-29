const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mime = require('mime');

let app = http.createServer((req, res) => {
    let { pathname } = url.parse(req.url);
    let filePath = path.join(__dirname, pathname);
    // stat读取文件属性信息
    fs.stat(filePath, (err, stat) => {
        if(err) {
            res.writeHead(404);
            res.end();
            return;
        } 
        let ifModifiedSince = req.headers['if-modified-since'];
        if(ifModifiedSince && stat.mtime.toGMTString() === ifModifiedSince) {
            res.writeHead(304);
            res.end();
        } else {
            // mtime是内容修改的时间
            res.setHeader('Last-Modified', stat.mtime.toGMTString());
            res.setHeader('Content-Type', mime.getType(pathname));
            fs.createReadStream(filePath).pipe(res);
        }
    })
})

app.listen(3000, function(err) {
    if(err) {
        console.log(err);
    }
    console.log('服务器启动');
})
