const APP = require( 'express' )();
console.log(1);
APP.listen(3000, (req, res) => {
    console.log( 'Servidor rodando na porta 3000 !!!' );
})
console.log(2);
APP.get( '/empregado/ti' , (req,res) => {
    res.send(req.query);
})
console.log(3);
console.log(2);
APP.post( '/empregado/ti' , (req,res) => {
    res.send( 'POST funcionando OK ' );
})
