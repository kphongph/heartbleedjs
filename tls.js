var util = require('util');

function tls () {
  this._buffer = null;
  this._pos = 0;
  this._totalData = 0;
  this._bufSize = 0;
}

tls.prototype.write = function(buf, len) {
  if(!len || !buf) return;

  var n = this._totalData + len;

  if(n > this._bufSize) {
    this._bufSize = Math.ceil(n / 8192) * 8192;
    var tmpBuf = new Buffer(this._bufSize);

    if (this._buffer) {
      this._buffer.copy(tmpBuf);
    }
    this._buffer = tmpBuf;
  }

  buf.copy(this._buffer, this._pos + this._totalData, 0, len);
  this._totalData += len;
};

tls.prototype.read = function() {
  if (!this._buffer || this._totalData < 5) return null;

  var len = this._buffer.readUInt16BE(this._pos + 3) + 5;

  if (this._totalData < len) return null;

  var msg = this._buffer.slice(this._pos, this._pos + len);
  this._pos += len;
  this._totalData -= len;
  return msg;
};

tls.prototype.__defineGetter__('length', function() {
  return this._totalData;
});

exports.tls = tls;
