const { Transform } = require('stream');
class DoubleStream extends Transform {
    constructor(options) {
        super(options);
    }
    _transform(chunk, encoding, callback) {
        this.push(chunk);
        this.push(chunk);
        callback();
    }
    _flush(callback) {
        this.push('嘻嘻嘻了呢\n');
        callback();
    }
}
var myDouble = new DoubleStream();
process.stdin
    .pipe(myDouble)
    .pipe(process.stdout);