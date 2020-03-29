const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mime = require('mime');
const crypto = require('crypto');

let app = http.createServer((req, res) => {
    // url模块，1、可以解析地址字符串，转成地址对象；url.parse() 2、生成地址，url.format();3、拼接地址，url.resolve()
    let { pathname } = url.parse(req.url);
    // path.join()拼接文件路径
    let filePath = path.join(__dirname, pathname);
    // fs.exists 判断文件是否存在，回调函数参数是true/false
    fs.exists(filePath, (exist) => {
        if(exist) {
            // fs.createReadStream();创建一个读取流，它是一部分一部分读取。readFile是读取了整个文件并将文件保存在内存
            let readStream = fs.createReadStream(filePath);
            // hash加密，生成一个不可逆的散列值。加密分为可逆加密和不可逆加密，可逆加密 = 对称加密 + 非对称加密
            let md5 = crypto.createHash('md5');
            readStream.on('data', (data) => {
                md5.update(data);
            })
            readStream.on('end', () => {
                let fileHash = md5.digest('hex');
                let ifNoneMatch = req.headers['if-none-match'];
                if(ifNoneMatch && fileHash === ifNoneMatch) {
                    res.writeHead(304);
                    res.end();
                } else {
                    res.setHeader('Etag', fileHash);
                    // 缓存一分钟
                    res.setHeader('Cache-Control', 'max-age=60')
                    res.setHeader('Content-Type', mime.getType(pathname));
                    fs.createReadStream(filePath).pipe(res);
                }
            })
        } else {
            res.writeHead(404);
            res.end();
            return;
        }
    })
})

app.listen(3000, function(err) {
    if(err) {
        console.log(err);
    }
    console.log('服务器启动');
})
