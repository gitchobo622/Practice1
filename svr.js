const express = require('express');
const mysql = require('mysql');
const path = require('path');
const static = require('serve-static')
const dbconfig = require('./config/dbconfig.json')
const morgan = require('morgan');
const bcrypt =require('bcrypt');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug:false
})

const app = express();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


app.use(morgan('dev')); //개발간 로그확인할수 있게 해주는 명령어 dev는 미들웨어의 형식

app.use(express.urlencoded({extended:true}));  // 여러가지 확장된 인코딩url로 받아오는 방식
app.use(express.json());   //json 파일도 읽어오게 하는 것 
app.use('/public', static(path.join(__dirname, 'public')));
// app.use('/public', static(path.join(__dirname, 'public'))); // '/public은 = 현재폴더에 'public'이라는 폴더가 그 주소다

app.listen(3030, () => {
    console.log('3030 듣고 있습니다.')
}
     );

     app.get('/', (req, res)=>{
        res.sendFile(__dirname+'/public/adduser.html')
     });

     app.get('/login', (req, res)=>{
        res.sendFile(__dirname+'/public/login.html')
     });
    
 //아래 포스트는- process/adduser 여기에서 처리하고, 처리하는건 뒤에 함수 방식에 따라 처리한다.  req 웹브라우저로부터 들어온값, req 웹 브라우저에게 답변
app.post('/process/adduser', (req, res) => {
    console.log('adduser부서로 누군가 호출했다' + req +'이런 내용이다') // 되는지 확인 

    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;
    const plainPassword = req.body.password;

    // bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    //     if (err) {
    //         console.error('비밀번호 해시화 오류:', err);
    //         res.status(500).send('데이터베이스 오류');
    //         return;
    //     }

        pool.getConnection((err, conn) => {
            if (err) {
                console.error('서버와 커넥션 에러:', err);
                res.status(500).send('서버 오류');
                return;
            }

            const exec = conn.query('INSERT INTO users (`id`, `name`, `age`, `password`) VALUES (?, ?, ?, ?);', [paramId, paramName, paramAge, paramPassword], (err, result) => {
                conn.release();
                if (err) {
                    console.error('SQL 실행 오류:', err);
                    res.status(500).send('데이터베이스 오류');
                    return;
                }

                console.log('사용자 추가 성공');
                res.status(200).send('사용자 추가 성공');
            });
        });
    });



app.post('/process/login', (req, res) => {
    console.log('/process/login 하자고 호출됨' +req.body.id)

    const paramId = req.body.id;
    const paramPassword = req.body.password;

    console.log('로그인 요청' + paramId);


    // bcrypt.hash(paramPassword, 10, (err, hashedPassword) => {
    //     if (err) {
    //         console.error('비밀번호 해시화 오류:', err);
    //         res.status(500).send('데이터베이스 오류');
    //         return;
    //     }

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('서버와 커넥션 에러:', err);
            res.status(500).send('서버 오류');
            return;
        }
        // conn.query('select `id`, `password` from `users` where `id`=? and `password`=?;', [paramId, hashedPassword], (err, rows)=>{
            conn.query('SELECT `id`, `name` FROM `users` WHERE `id`=? AND `password`=?;', [paramId, paramPassword], (err, rows) => {

                conn.release();
                if(err){
                    console.dir(err);
                }

            if (rows.length > 0) {
                // const storedHashedPassword = rows[0].password;
                // bcrypt.compare(paramPassword, storedHashedPassword, (bcryptErr, result) => {
                //     if (bcryptErr || !result) {
                        console.log('아이디 비번 일치값 찾음', paramId, rows[0].name);
                        console.log('로그인 성공');
                        res.status(200).send('로그인 성공');
                        res.end();

                } else {
                    console.error('아이디 비밀번호 확인해주세요');
                    res.status(500).send('계정 확인 불일치');

                return;
            }
        } );
    });
});
