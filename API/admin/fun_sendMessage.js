const db = require('../link/link.js');

function sendMessage(title, content, type, copy) {
    let sql = `INSERT INTO system_message (title,content,type,copy,create_time) VALUES 
    ('${title}','${content}','${type}','${copy}',now())`;
    db.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
    })
}


module.exports = sendMessage;