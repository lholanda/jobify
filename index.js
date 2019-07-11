const EXPRESS = require( 'express' ) 
const APP = EXPRESS()
const BODYPARSER = require( 'body-parser' )

const path = require('path')
const SQLITE = require( 'sqlite' ) // importa o banco
const DBCONEXAO = SQLITE.open(path.resolve(__dirname, 'banco.sqlite' ), { Promise }) // cria a conexao com o banco

const port = process.env.PORT || 3000



var luiz = " single-thread"

console.log ( "ponto de execucao 1"+luiz )

APP.set('views', path.join(__dirname, 'views'))
APP.set('view engine', 'ejs' )     // Setamos que nossa engine será o ejs
APP.use(EXPRESS.static( 'public' ))
//todas as requisicoes irao passar pelo BODYPARSER e vai tentar entende o que veio no corpo da requisicao
APP.use(BODYPARSER.urlencoded({ extended: true })) // entendendo a urlencoded
// Seleciona categorias e vagas (de cada categoria)
// ... spread operator
APP.get('/', async( request, response ) => {
   const DB = await DBCONEXAO
   const categoriasDb = await DB.all('select * from categorias;')  // tem que colocar ; se nao nao funciona
   const vagas = await DB.all('select * from vagas;')
   const categorias = categoriasDb.map(cat => {
     return {
       ...cat,
         vagas: vagas.filter( vaga => vaga.categoria === cat.id)  
     }
   })
   //console.log(categorias)
   response.render( 'home' , {
     categorias: categorias   // posso passar só categorias
   }) 
})
// Seleciona uma unica vaga /:id
APP.get('/vaga/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  const vaga = await DB.get('select * from vagas where id = '+req.params.id)
  // console.log(vaga)
  res.render( 'vaga', {
    vaga
  } )  
})
// rota para /admin
// posso colocar async tambem que funciona
APP.get('/admin', async( req,res ) => {
  res.render( 'admin/home' )
})
// ADMIN - Gerenciar Vagas
APP.get('/admin/vagas', async( req,res ) => {
  const DB = await DBCONEXAO
  const vagas = await DB.all( 'select * from vagas' )
  // passo vagas para vagas.ejs
  res.render( 'admin/vagas' , {
    vagas
  })
})
// ADMIN - Gerenciar Categorias
APP.get('/admin/categorias', async( req,res ) => {
  const DB = await DBCONEXAO
  const categorias = await DB.all( 'select * from categorias' )
  res.render( 'admin/categorias' , {
    categorias
  })
})
//***************::: ADMIN - VAGAS :::***************//
// ADMIN - Gerenciar Vagas = Inserir 
APP.get('/admin/vagas/nova', async( req, res ) => {
  const DB = await DBCONEXAO
  const categorias = await DB.all('select * from categorias')
  // passo categorias para nova-vaga.ejs
  res.render('admin/nova-vaga', { 
    categorias 
  }) 
})
// tempo: 1.24.12 aula 03, semana 4
// ADMIN - Gerenciar Vagas = Inserir POST 
APP.post('/admin/vagas/nova', async( req, res ) => {
  const DB = await DBCONEXAO
  const { titulo, descricao, categoria } = req.body //destruct assign
  await DB.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`)
  res.redirect( '/admin/vagas' ) 
})
// ADMIN - Gerenciar Vagas = Editar - GET
APP.get('/admin/vagas/editar/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  const categorias = await DB.all('select * from categorias')
  const idp = req.params.id
  const vaga = await DB.get(`select * from vagas where id = '${idp}'`)
  // const vaga = await DB.get('select * from vagas where id = '+ req.params.id)
  console.log(vaga)
  // passo categorias para nova-vaga.ejs
  res.render('admin/editar-vaga', { 
    categorias , vaga
  }) 
})
// ADMIN - Gerenciar Vagas = Editar POST 
APP.post('/admin/vagas/editar/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  const { titulo, descricao, categoria } = req.body //destruct assign
  const id = req.params.id // ou pode ser -> const { id } = req.params
  await DB.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = '${id}'`)
  res.redirect( '/admin/vagas' ) 
})
// ADMIN - Gerenciar Vagas = delete
APP.get('/admin/vagas/delete/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  await DB.run('delete from vagas where id = '+req.params.id)
  res.redirect('/admin/vagas') // redirecionar
})

//***************::: ADMIN - CATEGORIAS :::***************//
// ADMIN - Gerenciar Categoria = Inserir 
APP.get('/admin/categorias/nova', async( req, res ) => {
  res.render('admin/nova-categoria') 
})
// ADMIN - Gerenciar Categorias = Inserir POST 
APP.post('/admin/categorias/nova', async( req, res ) => {
  const DB = await DBCONEXAO
  const { categoria } = req.body //destruct assign
  await DB.run(`insert into categorias(categoria) values('${categoria}')`)
  res.redirect( '/admin/categorias' ) 
})
// ADMIN - Gerenciar Categorias = Editar - GET
APP.get('/admin/categorias/editar/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  const idp = req.params.id
  const categoria = await DB.get(`select * from categorias where id = '${idp}'`)
  console.log(categoria)
  res.render('admin/editar-categoria', { 
    categoria
  }) 
})
// ADMIN - Gerenciar Categorias = Editar POST 
APP.post('/admin/categorias/editar/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  const { categoria } = req.body //destruct assign
  const id = req.params.id // ou pode ser -> const { id } = req.params
  await DB.run(`update categorias set categoria = '${categoria}' where id = '${id}'`)
  res.redirect( '/admin/categorias' ) 
})
// ADMIN - Gerenciar Categorias = delete
APP.get('/admin/categorias/delete/:id', async( req, res ) => {
  const DB = await DBCONEXAO
  await DB.run('delete from categorias where id = '+req.params.id)
  res.redirect('/admin/categorias') // redirecionar
})


console.log( "ponto de execucao 2" )


const INITBD = async() => {
   const DB = await DBCONEXAO  // espera para ver se está pronta a conexao
   // cria todas as tabelas
   await DB.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
   await DB.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
  
   const INSERE_REGS = false
   if (INSERE_REGS){
    //  const categoria1 = 'Engineering team'
    //  const categoria2 = 'Marketing Team2'
    //  const vaga1 = 'FullStack Developer (Remote)'
    //  const vaga2 = 'Marketing Digital (San Francisco)'
    const vaga3 = 'Social Media(San Francisco)'
    //  const descricao1 = 'Vaga para FullStack que fez ....'
    //  const descricao2 = 'Vaga para Marketing Digital...'
    const descricao3 = 'Vaga para Social Media...'
     // populacionar categorias
    //  await DB.run(`insert into categorias(categoria)  values('${categoria1}')`) // crase = template string
    //  await DB.run(`insert into categorias(categoria)  values('${categoria2}')`) 
     // populacionar vagas
    //  await DB.run(`insert into vagas(categoria, titulo, descricao) values(1, '${vaga1}', '${descricao1}')`)
    //  await DB.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga2}', '${descricao2}')`)
    await DB.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga3}', '${descricao3}')`)
   }
}
console.log( "ponto de execucao 3" )

// Inicializa o app
INITBD();


APP.listen( port , ( err ) => {
    if ( err ) {
        console.log ( "Erro ao rodar o servidor Jobify" )
    } else {
        console.log ( "Servidor Jobify rodando na porta 3000 !!!" )
    }
})
console.log ( "ponto de execucao 4" )