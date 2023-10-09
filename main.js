const express = require('express');
const app = express();

app.listen(3020, ()=> {
    console.log('3020번에 귀를 대고 들어보자')
});

app.get('/' , (req, res) => {
    res.send('/ 로 들어온 루트에 대한 요청')
})

app.get('/about' , (req, res) => {

})