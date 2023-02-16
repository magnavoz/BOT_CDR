let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
  host: 'sftp.hdec.pe',
  port: '9122',
  username: 'user_magnavoz',
  password: 'Us3r_M4gn4v0z%'
}).then(() => {
  return sftp.list('/');
}).then(data => {
  console.log(data, 'the data info');
}).catch(err => {
  console.log(err, 'catch error');
});