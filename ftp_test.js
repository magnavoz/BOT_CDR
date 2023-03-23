let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
  host: 'sftp.grupokobsa.com.pe',
  port: '22',
  username: 'magnavoz',
  password: 'L7jdby7-8KJF{'
}).then(() => {
  return sftp.list('/');
}).then(data => {
  console.log(data, 'the data info');
}).catch(err => {
  console.log(err, 'catch error');
});